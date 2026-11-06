import pytest
from agents.claim_auditor_agent import audit_claims

def test_auditor_supported_and_rejected_claims():
    raw_facts = {
        "order_id": "ORD-1001",
        "verdict": "SHIP",
        "rule_triggered": "RULE_ALL_CHECKS_PASSED_SHIP",
        "findings": [
            {"check": "amount", "result": "OK", "reason": "Paid amount equals order total", "evidence": ["E1"]}
        ],
        "evidence": [
            {"id": "E1", "field": "order.total", "value": "49.99 USD"},
            {"id": "E2", "field": "capture.status", "value": "COMPLETED"}
        ]
    }

    ai_explanation = {
        "verdict": "SHIP",
        "summary": "Everything is verified.",
        "reasons": [
            "Order total matches gross captured payment of 49.99 USD [E1].",
            "Payment status is COMPLETED and funds are received [E2].",
            "The customer is a VIP buyer who bought 10 items previously."  # Unbacked claim!
        ]
    }

    audit = audit_claims(raw_facts, ai_explanation)
    assert audit["claims_removed_count"] == 1
    assert len(audit["supported_claims"]) == 2
    assert audit["rejected_claims"][0]["verification_result"] == "REJECTED"
    assert audit["verified_explanation"]["verdict"] == "SHIP"
