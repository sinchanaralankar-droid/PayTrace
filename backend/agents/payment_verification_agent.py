from typing import Dict, Any
from app.verification.rule_engine import verify_payment

def run_deterministic_verification(order: Dict[str, Any], payment: Dict[str, Any]) -> Dict[str, Any]:
    """
    Agent 2: Payment Verification Agent
    Deterministic, rule-based verification component.
    Has final and absolute authority over the candidate verdict (SHIP, HOLD, ASK).
    """
    return verify_payment(order, payment)
