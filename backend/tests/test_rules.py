import pytest
from app.verification.rule_engine import verify_payment

def test_case_1_clean_payment():
    order = {"id": "ORD-1001", "expected_amount": 49.99, "currency": "USD"}
    payment = {
        "capture_id": "CAP-1001",
        "capture_status": "COMPLETED",
        "captured_amount": 49.99,
        "currency": "USD",
        "refund_amount": 0.0,
        "invoice_id": "ORD-1001"
    }
    result = verify_payment(order, payment)
    assert result["verdict"] == "SHIP"
    assert result["rule_triggered"] == "RULE_ALL_CHECKS_PASSED_SHIP"

def test_case_2_pending_payment():
    order = {"id": "ORD-1002", "expected_amount": 120.00, "currency": "USD"}
    payment = {
        "capture_id": "CAP-1002",
        "capture_status": "PENDING",
        "captured_amount": 120.00,
        "currency": "USD",
        "refund_amount": 0.0,
        "invoice_id": "ORD-1002"
    }
    result = verify_payment(order, payment)
    assert result["verdict"] == "HOLD"
    assert "RULE_CAPTURE_STATUS_HOLD" in result["rule_triggered"]

def test_case_3_partial_capture():
    order = {"id": "ORD-1003", "expected_amount": 80.00, "currency": "USD"}
    payment = {
        "capture_id": "CAP-1003",
        "capture_status": "COMPLETED",
        "captured_amount": 50.00,
        "currency": "USD",
        "refund_amount": 0.0,
        "invoice_id": "ORD-1003"
    }
    result = verify_payment(order, payment)
    assert result["verdict"] == "HOLD"
    assert "RULE_AMOUNT_MATCH_HOLD" in result["rule_triggered"]

def test_case_4_refunded_payment():
    order = {"id": "ORD-1004", "expected_amount": 35.50, "currency": "USD"}
    payment = {
        "capture_id": "CAP-1004",
        "capture_status": "REFUNDED",
        "captured_amount": 35.50,
        "currency": "USD",
        "refund_amount": 35.50,
        "invoice_id": "ORD-1004"
    }
    result = verify_payment(order, payment)
    assert result["verdict"] == "HOLD"
    assert "RULE_REFUND_STATUS_HOLD" in result["rule_triggered"]

def test_case_5_invoice_mismatch():
    order = {"id": "ORD-1005", "expected_amount": 60.00, "currency": "USD"}
    payment = {
        "capture_id": "CAP-1005",
        "capture_status": "COMPLETED",
        "captured_amount": 60.00,
        "currency": "USD",
        "refund_amount": 0.0,
        "invoice_id": "ORD-9999"  # Mismatch
    }
    result = verify_payment(order, payment)
    assert result["verdict"] == "ASK"
    assert "RULE_REFERENCE_MATCH_ASK" in result["rule_triggered"]

def test_case_6_currency_mismatch_and_fee_breakdown():
    order = {"id": "ORD-1006", "expected_amount": 75.00, "currency": "USD"}
    payment = {
        "capture_id": "CAP-1006",
        "capture_status": "COMPLETED",
        "captured_amount": 75.00,
        "currency": "EUR",  # EUR vs USD
        "refund_amount": 0.0,
        "invoice_id": "ORD-1006"
    }
    result = verify_payment(order, payment)
    assert result["verdict"] == "HOLD"
    assert "RULE_CURRENCY_MATCH_HOLD" in result["rule_triggered"]
