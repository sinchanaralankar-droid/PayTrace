from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class OrderResponse(BaseModel):
    id: str
    customer_name: str
    customer_email: str
    product_name: str
    expected_amount: float
    currency: str
    paypal_order_id: str
    invoice_id: str
    created_at: str
    latest_verdict: Optional[str] = None
    latest_rule: Optional[str] = None
    last_verified_at: Optional[str] = None
    payment_status: Optional[str] = None
    capture_status: Optional[str] = None
    payment_source: Optional[str] = None

class EvidenceItem(BaseModel):
    id: str
    field: str
    value: str
    description: Optional[str] = None

class FindingItem(BaseModel):
    check: str
    result: str  # "OK", "HOLD", "ASK"
    reason: str
    evidence: List[str]

class ExplanationResponse(BaseModel):
    verdict: str
    summary: str
    reasons: List[str]
    evidence_cited: List[str]
    recommended_next_steps: List[str]
    customer_message_draft: str

class AuditorResponse(BaseModel):
    verified_explanation: Dict[str, Any]
    supported_claims: List[str]
    rejected_claims: List[Dict[str, str]]
    claims_removed_count: int
    verification_status: str  # "PASSED", "WARNING", "FAILED"

class VerificationResponse(BaseModel):
    id: Optional[int] = None
    order_id: str
    verdict: str  # "SHIP", "HOLD", "ASK"
    rule_triggered: str
    expected_amount: float
    captured_amount: float
    currency: str
    payment_status: str
    findings: List[FindingItem]
    evidence: List[EvidenceItem]
    warnings: List[str]
    ai_explanation: Dict[str, Any]
    auditor_result: Dict[str, Any]
    created_at: str

class ActionPreviewResponse(BaseModel):
    order_id: str
    action_type: str
    proposed_action: str
    safety_level: str  # "SAFE", "REQUIRES_CAUTION", "BLOCKED"
    can_execute: bool
    reasons: List[str]
    confirmation_prompt: str
    customer_message_draft: str

class ActionApprovalRequest(BaseModel):
    action_type: str
    custom_note: Optional[str] = None
    customer_message: Optional[str] = None

class ActionApprovalResponse(BaseModel):
    action_id: int
    order_id: str
    action_type: str
    status: str
    execution_result: str
    executed_at: str

class DashboardStats(BaseModel):
    total_orders: int
    ship_count: int
    hold_count: int
    ask_count: int
    verification_accuracy_pct: float
    unsupported_claims_removed: int
    sandbox_mode: str  # "LIVE" or "MOCK"

class SandboxStatus(BaseModel):
    configured: bool
    live_connected: bool
    base_url: str
    client_id_prefix: str
    error_message: Optional[str] = None


class ChatMessageRequest(BaseModel):
    message: str
    order_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = None

class ChatMessageResponse(BaseModel):
    reply: str
    cited_orders: List[str] = Field(default_factory=list)
    suggested_questions: List[str] = Field(default_factory=list)

class SoundboxStatusResponse(BaseModel):
    device_name: str
    status: str  # "CONNECTED", "DISCONNECTED", "PAIRING"
    battery_level: int
    volume: int
    auto_announce: bool
    firmware_version: str

class SoundboxBroadcastRequest(BaseModel):
    order_id: str
    event_type: Optional[str] = "VERIFICATION_COMPLETE"

class SoundboxBroadcastResponse(BaseModel):
    order_id: str
    verdict: str
    audio_text: str
    chime_type: str  # "success", "alert", "notice"
    timestamp: str
    status: str
