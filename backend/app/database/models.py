import json
from dataclasses import dataclass, asdict, field
from datetime import datetime
from typing import Optional, Any, Dict, List

@dataclass
class OrderModel:
    id: str
    customer_name: str
    customer_email: str
    product_name: str
    expected_amount: float
    currency: str
    paypal_order_id: str
    invoice_id: str
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class PaymentModel:
    paypal_order_id: str
    capture_id: str
    payment_status: str
    capture_status: str
    captured_amount: float
    currency: str
    refund_amount: float
    paypal_fee: float
    net_amount: float
    invoice_id: str
    raw_response: str
    source: str  # "paypal_sandbox" or "mock"
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        try:
            d["raw_response"] = json.loads(self.raw_response)
        except Exception:
            pass
        return d

@dataclass
class VerificationModel:
    id: Optional[int]
    order_id: str
    verdict: str  # "SHIP", "HOLD", "ASK"
    rule_triggered: str
    findings_json: str
    evidence_json: str
    ai_explanation_json: str
    auditor_result_json: str
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "order_id": self.order_id,
            "verdict": self.verdict,
            "rule_triggered": self.rule_triggered,
            "findings": json.loads(self.findings_json) if self.findings_json else [],
            "evidence": json.loads(self.evidence_json) if self.evidence_json else [],
            "ai_explanation": json.loads(self.ai_explanation_json) if self.ai_explanation_json else {},
            "auditor_result": json.loads(self.auditor_result_json) if self.auditor_result_json else {},
            "created_at": self.created_at,
        }

@dataclass
class MerchantActionModel:
    id: Optional[int]
    order_id: str
    action_type: str
    proposed_action: str
    status: str  # "PENDING_APPROVAL", "APPROVED", "EXECUTED", "REJECTED"
    customer_message: str
    execution_result: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    executed_at: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
