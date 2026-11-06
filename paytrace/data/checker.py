"""Rule-based checks. No AI here: plain Python decides SHIP / HOLD / ASK."""
import json
from decimal import Decimal
from pathlib import Path

DATA = Path(__file__).parent / "data"


def _load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def load_order(order_id):
    for o in _load("orders.json"):
        if o["order_id"] == order_id:
            return o
    return None


def load_payment(payment_id):
    # Step 1 uses mock data shaped like PayPal order responses.
    # Later: replace this with a live PayPal Sandbox call (same return shape).
    return _load("payments_mock.json").get(payment_id)


def _money(m):
    return f'{m["value"]} {m["currency_code"]}'


def _summary(order, findings, evidence):
    results = [f["result"] for f in findings]
    verdict = "HOLD" if "HOLD" in results else "ASK" if "ASK" in results else "SHIP"
    return {
        "order_id": order["order_id"],
        "verdict": verdict,
        "findings": findings,
        "evidence": evidence,
    }


def run_checks(order, payment):
    evidence, findings = [], []

    def ev(field, value):
        eid = f"E{len(evidence) + 1}"
        evidence.append({"id": eid, "field": field, "value": value})
        return eid

    def add(check, result, reason, ids):
        findings.append({"check": check, "result": result, "reason": reason, "evidence": ids})

    e_total = ev("order.total", f'{order["total"]} {order["currency"]}')
    e_ref = ev("order.order_id", order["order_id"])

    captures, refunds = [], []
    if payment:
        pays = (payment.get("purchase_units") or [{}])[0].get("payments", {})
        captures = pays.get("captures", [])
        refunds = pays.get("refunds", [])

    if not captures:
        e = ev("payment", "no capture found" if payment else "no payment found")
        add("payment_found", "HOLD", "No captured payment was found for this order.", [e])
        return _summary(order, findings, evidence)

    cap = captures[0]

    # 1. Capture status
    status = cap.get("status")
    e_status = ev("capture.status", status)
    if status == "COMPLETED":
        add("capture_status", "OK", "Payment status is COMPLETED.", [e_status])
    elif status not in ("REFUNDED", "PARTIALLY_REFUNDED"):
        ids, text = [e_status], f"Payment status is {status}, not COMPLETED."
        reason = (cap.get("status_details") or {}).get("reason")
        if reason:
            ids.append(ev("capture.status_details.reason", reason))
            text += f" PayPal reason: {reason}."
        add("capture_status", "HOLD", text, ids)

    # 2. Refunds
    if refunds or status in ("REFUNDED", "PARTIALLY_REFUNDED"):
        ids = [e_status]
        for r in refunds:
            ids.append(ev("refund.amount", _money(r["amount"])))
        add("refund", "HOLD", "This payment has been refunded (fully or partly).", ids)

    # 3. Currency and amount
    cap_amt = cap["amount"]
    e_cap = ev("capture.amount", _money(cap_amt))
    if cap_amt["currency_code"] != order["currency"]:
        add("currency", "ASK",
            f'Order is in {order["currency"]} but the payment is in {cap_amt["currency_code"]}.',
            [e_total, e_cap])
    else:
        paid, due = Decimal(cap_amt["value"]), Decimal(order["total"])
        if paid < due:
            add("amount", "HOLD", f"Paid {paid}, which is less than the order total {due}.", [e_total, e_cap])
        elif paid > due:
            add("amount", "ASK", f"Paid {paid}, which is more than the order total {due}.", [e_total, e_cap])
        else:
            add("amount", "OK", "Paid amount equals the order total.", [e_total, e_cap])

    # 4. Order reference
    inv = cap.get("invoice_id")
    e_inv = ev("capture.invoice_id", inv or "missing")
    if inv != order["order_id"]:
        add("reference", "ASK", "The payment's invoice ID does not match this order ID.", [e_ref, e_inv])
    else:
        add("reference", "OK", "Invoice ID matches the order ID.", [e_ref, e_inv])

    # 5. Fees (informational only, never a mismatch)
    brk = cap.get("seller_receivable_breakdown") or {}
    if brk.get("paypal_fee") and brk.get("net_amount"):
        e_net = ev("capture.net_amount", _money(brk["net_amount"]))
        add("fees", "OK",
            f'PayPal fee is {_money(brk["paypal_fee"])}; the merchant receives {_money(brk["net_amount"])}. '
            "Fees are not treated as a mismatch.",
            [e_net])

    return _summary(order, findings, evidence)