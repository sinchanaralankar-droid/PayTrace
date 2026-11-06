import json
from typing import Dict, Any
from app.database.database import (
    get_order_by_id,
    save_verification,
    get_latest_verification,
    VerificationModel
)
from agents.payment_retrieval_agent import retrieve_payment_evidence
from agents.payment_verification_agent import run_deterministic_verification
from agents.explanation_agent import generate_explanation
from agents.claim_auditor_agent import audit_claims
from agents.merchant_action_agent import prepare_merchant_action

class PayTraceOrchestrator:
    """
    Agent 6: Orchestrator / Root Agent (Google ADK Workflow)
    Coordinates the multi-agent pipeline:
    1. Payment Retrieval Agent
    2. Payment Verification Agent (Deterministic Rules)
    3. AI Explanation Agent (Gemini)
    4. AI Claim Auditor Agent (Fact Checker)
    5. Merchant Action Agent (Safe Human-in-the-Loop Actions)
    """

    async def run(self, order_id: str) -> Dict[str, Any]:
        # Step 1: Payment Retrieval
        retrieval_result = await retrieve_payment_evidence(order_id)
        if retrieval_result.get("status") != "SUCCESS":
            return {
                "order_id": order_id,
                "verdict": "ASK",
                "rule_triggered": "ORDER_RETRIEVAL_FAILED",
                "expected_amount": 0.0,
                "captured_amount": 0.0,
                "currency": "USD",
                "payment_status": "UNKNOWN",
                "findings": [{
                    "check": "order_lookup",
                    "result": "ASK",
                    "reason": retrieval_result.get("error", "Failed to retrieve order"),
                    "evidence": []
                }],
                "evidence": [],
                "warnings": [retrieval_result.get("error", "Lookup error")],
                "ai_explanation": {},
                "auditor_result": {},
                "merchant_action": {}
            }

        order = retrieval_result["order"]
        payment = retrieval_result["payment"]

        # Step 2: Deterministic Rule Verification
        # Final authority resides here
        raw_facts = run_deterministic_verification(order, payment)

        # Step 3: AI Explanation Agent (Gemini)
        raw_explanation = await generate_explanation(raw_facts, order)

        # Step 4: AI Claim Auditor Agent (Fact-Checking)
        audit_result = audit_claims(raw_facts, raw_explanation)
        verified_explanation = audit_result["verified_explanation"]

        # Step 5: Merchant Action Agent
        action_preview = prepare_merchant_action(raw_facts, verified_explanation)

        # Step 6: Persist Verification
        v_model = VerificationModel(
            id=None,
            order_id=order_id,
            verdict=raw_facts["verdict"],
            rule_triggered=raw_facts["rule_triggered"],
            findings_json=json.dumps(raw_facts.get("findings", [])),
            evidence_json=json.dumps(raw_facts.get("evidence", [])),
            ai_explanation_json=json.dumps(verified_explanation),
            auditor_result_json=json.dumps(audit_result)
        )
        v_id = save_verification(v_model)

        return {
            "id": v_id,
            "order_id": order_id,
            "verdict": raw_facts["verdict"],
            "rule_triggered": raw_facts["rule_triggered"],
            "expected_amount": raw_facts["expected_amount"],
            "captured_amount": raw_facts["captured_amount"],
            "currency": raw_facts["currency"],
            "payment_status": raw_facts["payment_status"],
            "findings": raw_facts.get("findings", []),
            "evidence": raw_facts.get("evidence", []),
            "warnings": raw_facts.get("warnings", []),
            "ai_explanation": verified_explanation,
            "auditor_result": audit_result,
            "merchant_action": action_preview,
            "data_source": retrieval_result.get("data_source", "mock")
        }

root_orchestrator = PayTraceOrchestrator()
