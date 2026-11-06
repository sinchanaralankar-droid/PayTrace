export type Verdict = 'SHIP' | 'HOLD' | 'ASK' | 'UNVERIFIED';

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  expected_amount: number;
  currency: string;
  paypal_order_id: string;
  invoice_id: string;
  created_at: string;
  latest_verdict?: Verdict;
  latest_rule?: string;
  last_verified_at?: string;
  payment_status?: string;
  capture_status?: string;
  payment_source?: string;
}

export interface PaymentDetails {
  paypal_order_id: string;
  capture_id: string;
  payment_status: string;
  capture_status: string;
  captured_amount: number;
  currency: string;
  refund_amount: number;
  paypal_fee: number;
  net_amount: number;
  invoice_id: string;
  raw_response: any;
  source: string;
  updated_at: string;
}

export interface EvidenceItem {
  id: string;
  field: string;
  value: string;
  description?: string;
}

export interface FindingItem {
  check: string;
  result: 'OK' | 'HOLD' | 'ASK';
  reason: string;
  evidence: string[];
}

export interface AIExplanation {
  verdict: Verdict;
  summary: string;
  reasons: string[];
  evidence_cited: string[];
  recommended_next_steps: string[];
  customer_message_draft: string;
}

export interface ClaimRejection {
  original_claim: string;
  verification_result: string;
  reason_for_rejection: string;
}

export interface AuditorResult {
  verified_explanation: AIExplanation;
  supported_claims: string[];
  rejected_claims: ClaimRejection[];
  claims_removed_count: number;
  verification_status: 'PASSED' | 'WARNING' | 'FAILED';
  audit_summary?: string;
}

export interface VerificationResponse {
  id?: number;
  order_id: string;
  verdict: Verdict;
  rule_triggered: string;
  expected_amount: number;
  captured_amount: number;
  currency: string;
  payment_status: string;
  findings: FindingItem[];
  evidence: EvidenceItem[];
  warnings: string[];
  ai_explanation: AIExplanation;
  auditor_result: AuditorResult;
  created_at: string;
}

export interface ActionPreview {
  order_id: string;
  action_type: string;
  proposed_action: string;
  safety_level: 'SAFE' | 'REQUIRES_CAUTION' | 'BLOCKED';
  can_execute: boolean;
  reasons: string[];
  confirmation_prompt: string;
  customer_message_draft: string;
}

export interface MerchantActionRecord {
  id: number;
  order_id: string;
  action_type: string;
  proposed_action: string;
  status: string;
  customer_message: string;
  execution_result?: string;
  created_at: string;
  executed_at?: string;
}

export interface DashboardStats {
  total_orders: number;
  ship_count: number;
  hold_count: number;
  ask_count: number;
  verification_accuracy_pct: number;
  unsupported_claims_removed: number;
  sandbox_mode: 'LIVE' | 'MOCK';
}

export interface SandboxStatus {
  configured: boolean;
  live_connected: boolean;
  base_url: string;
  client_id_prefix: string;
  error_message?: string;
}


export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citedOrders?: string[];
}

export interface SoundboxStatus {
  device_name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'PAIRING';
  battery_level: number;
  volume: number;
  auto_announce: boolean;
  firmware_version: string;
}

export interface SoundboxBroadcast {
  order_id: string;
  verdict: string;
  audio_text: string;
  chime_type: 'success' | 'alert' | 'notice';
  timestamp: string;
  status: string;
}
