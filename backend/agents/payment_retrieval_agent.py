import json
from typing import Dict, Any, Optional
from app.database.database import get_order_by_id, get_payment_by_order_id, upsert_payment
from app.database.models import PaymentModel
from app.paypal.client import paypal_client

async def retrieve_payment_evidence(order_id: str) -> Dict[str, Any]:
    """
    Agent 1: Payment Retrieval Agent
    Retrieves order details and fetches the PayPal payment record from live PayPal Sandbox,
    falling back to locally stored/cached payment record when necessary.
    Normalizes the payload and returns structured payment evidence.
    """
    order = get_order_by_id(order_id)
    if not order:
        return {
            "status": "NOT_FOUND",
            "order": None,
            "payment": None,
            "error": f"Order {order_id} not found in database"
        }

    order_dict = order.to_dict()
    paypal_order_id = order.paypal_order_id

    # 1. Try fetching from live PayPal Sandbox
    live_paypal_data: Optional[Dict[str, Any]] = None
    source = "mock"
    try:
        live_paypal_data = await paypal_client.get_order(paypal_order_id)
        if live_paypal_data:
            source = "paypal_sandbox"
    except Exception:
        live_paypal_data = None

    # 2. If live PayPal returned data, normalize and update DB
    if live_paypal_data:
        # Extract capture details
        purchase_units = live_paypal_data.get("purchase_units", [{}])
        payments = purchase_units[0].get("payments", {}) if purchase_units else {}
        captures = payments.get("captures", [])
        refunds = payments.get("refunds", [])

        cap = captures[0] if captures else {}
        ref = refunds[0] if refunds else {}

        cap_amt = float(cap.get("amount", {}).get("value", 0.0))
        curr = cap.get("amount", {}).get("currency_code", order.currency)
        ref_amt = float(ref.get("amount", {}).get("value", 0.0))
        
        breakdown = cap.get("seller_receivable_breakdown", {})
        fee_amt = float(breakdown.get("paypal_fee", {}).get("value", 0.0))
        net_amt = float(breakdown.get("net_amount", {}).get("value", cap_amt - fee_amt))

        payment_model = PaymentModel(
            paypal_order_id=paypal_order_id,
            capture_id=cap.get("id", "CAP-UNKNOWN"),
            payment_status=live_paypal_data.get("status", "UNKNOWN"),
            capture_status=cap.get("status", "UNKNOWN"),
            captured_amount=cap_amt,
            currency=curr,
            refund_amount=ref_amt,
            paypal_fee=fee_amt,
            net_amount=net_amt,
            invoice_id=cap.get("invoice_id", ""),
            raw_response=json.dumps(live_paypal_data),
            source="paypal_sandbox"
        )
        upsert_payment(payment_model)
        payment_dict = payment_model.to_dict()
    else:
        # Load cached/mock payment from DB
        db_payment = get_payment_by_order_id(paypal_order_id)
        if db_payment:
            payment_dict = db_payment.to_dict()
        else:
            payment_dict = {
                "paypal_order_id": paypal_order_id,
                "capture_id": "NONE",
                "payment_status": "NOT_FOUND",
                "capture_status": "NOT_FOUND",
                "captured_amount": 0.0,
                "currency": order.currency,
                "refund_amount": 0.0,
                "paypal_fee": 0.0,
                "net_amount": 0.0,
                "invoice_id": "",
                "raw_response": {},
                "source": "mock"
            }

    return {
        "status": "SUCCESS",
        "order": order_dict,
        "payment": payment_dict,
        "data_source": payment_dict.get("source", "mock")
    }
