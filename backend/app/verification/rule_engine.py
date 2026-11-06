"""
Deterministic rule-based payment verification engine.
This engine has absolute, final authority over the payment verdict.
No LLM or agent can override the verdict computed here.
"""
from decimal import Decimal
from typing import Dict, Any, List, Tuple

def _money(val: Any, curr: str) -> str:
    return f"{float(val):.2f} {curr}"

def verify_payment(order: Dict[str, Any], payment: Dict[str, Any]) -> Dict[str, Any]:
    evidence: List[Dict[str, str]] = []
    findings: List[Dict[str, Any]] = []
    warnings: List[str] = []

    def ev(field: str, value: Any, desc: str = "") -> str:
        eid = f"E{len(evidence) + 1}"
        evidence.append({"id": eid, "field": field, "value": str(value), "description": desc})
        return eid

    e_total = ev("order.total", _money(order["expected_amount"], order["currency"]), "Expected order amount")
    e_order_id = ev("order.order_id", order["id"], "Merchant Order Reference")

    captures: List[Dict[str, Any]] = []
    refunds: List[Dict[str, Any]] = []

    if payment:
        raw = payment.get("raw_response", {})
        if isinstance(raw, dict):
            pus = raw.get("purchase_units", [{}])
            if pus:
                pays = pus[0].get("payments", {})
                captures = pays.get("captures", [])
                refunds = pays.get("refunds", [])

    # If no capture list extracted from raw, fall back to top-level payment fields
    if not captures and payment.get("capture_id"):
        captures = [{
            "id": payment["capture_id"],
            "status": payment["capture_status"],
            "amount": {
                "currency_code": payment["currency"],
                "value": str(payment["captured_amount"])
            },
            "invoice_id": payment.get("invoice_id", "")
        }]

    if payment.get("refund_amount", 0) > 0 and not refunds:
        refunds = [{
            "id": "REF-RECORDED",
            "status": "COMPLETED",
            "amount": {
                "currency_code": payment.get("currency", order["currency"]),
                "value": str(payment["refund_amount"])
            }
        }]

    # RULE 0: Payment capture existence
    if not captures:
        e_none = ev("payment", "no capture found", "PayPal payment capture check")
        findings.append({
            "check": "capture_existence",
            "result": "HOLD",
            "reason": "No captured payment was found in PayPal Sandbox for this order.",
            "evidence": [e_none]
        })
        return _build_result(order, findings, evidence, warnings, rule_name="NO_PAYMENT_FOUND")

    cap = captures[0]
    cap_status = cap.get("status", "UNKNOWN")
    e_status = ev("capture.status", cap_status, "PayPal Capture Status")

    # RULE 1: Capture Status Check
    if cap_status == "COMPLETED":
        findings.append({
            "check": "capture_status",
            "result": "OK",
            "reason": "Payment capture is COMPLETED and funds are secured in merchant account.",
            "evidence": [e_status]
        })
    elif cap_status in ("PENDING", "HELD", "PAYER_ACTION_REQUIRED"):
        reason_detail = (cap.get("status_details") or {}).get("reason", "Pending PayPal review or processing")
        e_detail = ev("capture.status_details.reason", reason_detail, "Pending hold explanation")
        findings.append({
            "check": "capture_status",
            "result": "HOLD",
            "reason": f"Payment status is {cap_status}. Reason: {reason_detail}.",
            "evidence": [e_status, e_detail]
        })
    elif cap_status not in ("REFUNDED", "PARTIALLY_REFUNDED"):
        findings.append({
            "check": "capture_status",
            "result": "HOLD",
            "reason": f"Payment status is {cap_status}, not COMPLETED.",
            "evidence": [e_status]
        })

    # RULE 2: Refund Check
    if refunds or cap_status in ("REFUNDED", "PARTIALLY_REFUNDED"):
        ref_ids = [e_status]
        tot_refunded = Decimal("0.00")
        for r in refunds:
            r_val = r.get("amount", {}).get("value", "0.00")
            r_curr = r.get("amount", {}).get("currency_code", order["currency"])
            tot_refunded += Decimal(str(r_val))
            ref_ids.append(ev("refund.amount", f"{r_val} {r_curr}", "Processed refund"))

        findings.append({
            "check": "refund_status",
            "result": "HOLD",
            "reason": f"Payment has been refunded (total refunded: {tot_refunded} {order['currency']}) and no longer covers the order.",
            "evidence": ref_ids
        })

    # RULE 3: Currency Validation
    cap_amt_obj = cap.get("amount", {})
    cap_currency = cap_amt_obj.get("currency_code", payment.get("currency", "USD"))
    e_curr = ev("capture.currency", cap_currency, "Captured Currency")
    if cap_currency != order["currency"]:
        findings.append({
            "check": "currency_match",
            "result": "HOLD",
            "reason": f"Currency mismatch: Order expects {order['currency']}, but PayPal captured {cap_currency}.",
            "evidence": [e_total, e_curr]
        })
    else:
        findings.append({
            "check": "currency_match",
            "result": "OK",
            "reason": f"Currency matches expected {order['currency']}.",
            "evidence": [e_curr]
        })

    # RULE 4: Gross Captured Amount vs Order Total
    # IMPORTANT: Compare GROSS captured amount, NOT net amount after PayPal fee deductions!
    cap_val_str = str(cap_amt_obj.get("value", payment.get("captured_amount", "0.00")))
    e_cap_amt = ev("capture.gross_amount", _money(cap_val_str, cap_currency), "Gross amount captured from customer")
    
    paid_gross = Decimal(cap_val_str)
    order_total = Decimal(str(order["expected_amount"]))

    if paid_gross < order_total:
        diff = order_total - paid_gross
        findings.append({
            "check": "amount_match",
            "result": "HOLD",
            "reason": f"Partial capture: Customer paid {paid_gross} {cap_currency}, which is less than the order total {order_total} {order['currency']} (Shortfall: {diff}).",
            "evidence": [e_total, e_cap_amt]
        })
    elif paid_gross > order_total:
        excess = paid_gross - order_total
        findings.append({
            "check": "amount_match",
            "result": "ASK",
            "reason": f"Overpayment detected: Customer paid {paid_gross} {cap_currency}, which is more than order total {order_total} {order['currency']} (Excess: {excess}).",
            "evidence": [e_total, e_cap_amt]
        })
    else:
        findings.append({
            "check": "amount_match",
            "result": "OK",
            "reason": f"Captured gross amount {paid_gross} {cap_currency} matches expected order total.",
            "evidence": [e_total, e_cap_amt]
        })

    # RULE 5: Order Reference / Invoice ID Check
    inv_id = cap.get("invoice_id") or payment.get("invoice_id")
    e_inv = ev("capture.invoice_id", inv_id or "MISSING", "PayPal payment invoice reference")
    if not inv_id:
        findings.append({
            "check": "reference_match",
            "result": "ASK",
            "reason": "Missing invoice/order reference in PayPal transaction.",
            "evidence": [e_order_id, e_inv]
        })
    elif inv_id != order["id"]:
        findings.append({
            "check": "reference_match",
            "result": "ASK",
            "reason": f"Order reference mismatch: PayPal invoice ID is '{inv_id}', but order is '{order['id']}'.",
            "evidence": [e_order_id, e_inv]
        })
    else:
        findings.append({
            "check": "reference_match",
            "result": "OK",
            "reason": f"PayPal invoice ID '{inv_id}' matches order ID '{order['id']}'.",
            "evidence": [e_order_id, e_inv]
        })

    # RULE 6: PayPal Fee & Net Settlement Breakdown (Informational only, never a mismatch)
    brk = cap.get("seller_receivable_breakdown") or {}
    fee_val = brk.get("paypal_fee", {}).get("value")
    net_val = brk.get("net_amount", {}).get("value")
    if fee_val and net_val:
        e_fee = ev("capture.paypal_fee", _money(fee_val, cap_currency), "PayPal transaction processing fee")
        e_net = ev("capture.net_settlement", _money(net_val, cap_currency), "Net merchant settlement")
        findings.append({
            "check": "seller_receivable_breakdown",
            "result": "OK",
            "reason": f"PayPal fee is {_money(fee_val, cap_currency)}; net payout is {_money(net_val, cap_currency)}. Fee is verified and not counted as an amount shortfall.",
            "evidence": [e_fee, e_net]
        })

    return _build_result(order, findings, evidence, warnings, rule_name="DETERMINISTIC_RULES")

def _build_result(order: Dict[str, Any], findings: List[Dict[str, Any]],
                  evidence: List[Dict[str, str]], warnings: List[str], rule_name: str) -> Dict[str, Any]:
    results = [f["result"] for f in findings]
    
    if "HOLD" in results:
        verdict = "HOLD"
        # Identify first failing check
        failed = next(f for f in findings if f["result"] == "HOLD")
        rule_triggered = f"RULE_{failed['check'].upper()}_HOLD"
    elif "ASK" in results:
        verdict = "ASK"
        failed = next(f for f in findings if f["result"] == "ASK")
        rule_triggered = f"RULE_{failed['check'].upper()}_ASK"
    else:
        verdict = "SHIP"
        rule_triggered = "RULE_ALL_CHECKS_PASSED_SHIP"

    return {
        "order_id": order["id"],
        "verdict": verdict,
        "rule_triggered": rule_triggered,
        "expected_amount": float(order["expected_amount"]),
        "captured_amount": float(next((e["value"].split()[0] for e in evidence if e["field"] == "capture.gross_amount"), 0.0)),
        "currency": order["currency"],
        "payment_status": next((e["value"] for e in evidence if e["field"] == "capture.status"), "UNKNOWN"),
        "findings": findings,
        "evidence": evidence,
        "warnings": warnings,
    }
