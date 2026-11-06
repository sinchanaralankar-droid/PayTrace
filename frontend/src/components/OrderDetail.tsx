import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  User,
  Package,
  FileText,
  Copy,
  Check,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { Order, PaymentDetails, VerificationResponse, MerchantActionRecord, ActionPreview } from '../types';

interface OrderDetailProps {
  order: Order | null;
  payment: PaymentDetails | null;
  verification: VerificationResponse | null;
  actionHistory: MerchantActionRecord[];
  isVerifying: boolean;
  onRunVerify: () => void;
  onOpenActionModal: (preview: ActionPreview) => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  payment,
  verification,
  actionHistory,
  isVerifying,
  onRunVerify,
  onOpenActionModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRawPayload, setShowRawPayload] = useState(false);

  if (!order) {
    return (
      <div className="bg-pastel-card rounded-2xl border border-pastel-border shadow-sm h-[calc(100vh-13rem)] flex items-center justify-center p-8 text-center text-pastel-muted">
        <div>
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30 text-pastel-muted" />
          <h3 className="text-lg font-semibold text-pastel-darkText">No Order Selected</h3>
          <p className="text-sm text-pastel-subText max-w-sm mt-1">
            Select an order from the list on the left to inspect its PayPal payment status and AI-audited shipment decision.
          </p>
        </div>
      </div>
    );
  }

  const verdict = verification?.verdict || order.latest_verdict || 'UNVERIFIED';

  const handleCopyMessage = () => {
    const text = verification?.ai_explanation?.customer_message_draft || '';
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTriggerAction = () => {
    const preview: ActionPreview = {
      order_id: order.id,
      action_type: verdict === 'SHIP' ? 'FULFILL_ORDER' : verdict === 'HOLD' ? 'HOLD_PENDING_SETTLEMENT' : 'MANUAL_REFERENCE_VERIFY',
      proposed_action: verdict === 'SHIP' ? 'Fulfill Order and Generate Shipping Label' : verdict === 'HOLD' ? 'Hold Shipment & Notify Customer' : 'Flag for Manual Reference Review',
      safety_level: verdict === 'SHIP' ? 'SAFE' : 'REQUIRES_CAUTION',
      can_execute: true,
      reasons: verification?.ai_explanation?.reasons || ['Action determined by PayTrace rules.'],
      confirmation_prompt: `Confirm executing action for ${order.id}.`,
      customer_message_draft: verification?.ai_explanation?.customer_message_draft || '',
    };
    onOpenActionModal(preview);
  };

  return (
    <div className="bg-pastel-card rounded-2xl border border-pastel-border shadow-sm h-[calc(100vh-13rem)] flex flex-col overflow-hidden">
      {/* Top Banner / Verdict Header */}
      <div className="p-5 border-b border-pastel-border bg-pastel-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-pastel-darkText font-mono tracking-tight">{order.id}</h2>
            {verdict === 'SHIP' && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-pastel-mintBg text-pastel-mintText border border-pastel-mintBorder flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-pastel-mintSolid" /> SHIP – READY TO FULFILL
              </span>
            )}
            {verdict === 'HOLD' && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-pastel-roseBg text-pastel-roseText border border-pastel-roseBorder flex items-center gap-1.5 shadow-sm">
                <AlertCircle className="h-4 w-4 text-pastel-roseSolid" /> HOLD – DO NOT SHIP
              </span>
            )}
            {verdict === 'ASK' && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-pastel-amberBg text-pastel-amberText border border-pastel-amberBorder flex items-center gap-1.5 shadow-sm">
                <HelpCircle className="h-4 w-4 text-pastel-amberSolid" /> ASK – MANUAL REVIEW REQUIRED
              </span>
            )}
          </div>
          <p className="text-xs text-pastel-subText mt-1">
            Customer: <strong className="text-pastel-darkText">{order.customer_name}</strong> • Product: <strong className="text-pastel-darkText">{order.product_name}</strong>
          </p>
        </div>

        {/* Verification Action Button */}
        <button
          onClick={onRunVerify}
          disabled={isVerifying}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pastel-skySolid hover:bg-sky-700 text-white shadow-sm transition disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          {isVerifying ? 'Running Multi-Agent Check...' : 'Re-verify with Google ADK'}
        </button>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-pastel-bg/40">
        {/* SECTION A & B: Order and PayPal Telemetry Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order Details Card */}
          <div className="p-4 rounded-xl bg-pastel-card border border-pastel-border space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-pastel-muted uppercase tracking-wider mb-2">
              <Package className="h-4 w-4 text-pastel-skySolid" /> Merchant Order Specs
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-pastel-muted">Expected Total:</span>
                <p className="font-bold text-pastel-darkText text-sm">${order.expected_amount.toFixed(2)} {order.currency}</p>
              </div>
              <div>
                <span className="text-pastel-muted">Invoice ID:</span>
                <p className="font-mono text-pastel-darkText">{order.invoice_id}</p>
              </div>
              <div>
                <span className="text-pastel-muted">Customer Email:</span>
                <p className="text-pastel-darkText truncate">{order.customer_email}</p>
              </div>
              <div>
                <span className="text-pastel-muted">Creation Date:</span>
                <p className="text-pastel-darkText">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* PayPal Telemetry Card */}
          <div className="p-4 rounded-xl bg-pastel-card border border-pastel-border space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-pastel-muted uppercase tracking-wider">
                <CreditCard className="h-4 w-4 text-pastel-lavenderSolid" /> PayPal Sandbox Telemetry
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-pastel-bg text-pastel-muted border border-pastel-border">
                {payment?.source === 'paypal_sandbox' ? 'LIVE SANDBOX' : 'MOCK / SIMULATED'}
              </span>
            </div>
            {payment ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-pastel-muted">Capture Status:</span>
                  <p className={`font-bold ${payment.capture_status === 'COMPLETED' ? 'text-pastel-mintText' : 'text-pastel-roseText'}`}>
                    {payment.capture_status}
                  </p>
                </div>
                <div>
                  <span className="text-pastel-muted">Gross Captured:</span>
                  <p className="font-bold text-pastel-darkText text-sm">
                    {payment.captured_amount.toFixed(2)} {payment.currency}
                  </p>
                </div>
                <div>
                  <span className="text-pastel-muted">PayPal Fee:</span>
                  <p className="text-pastel-darkText font-mono">${payment.paypal_fee.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-pastel-muted">Net Merchant Payout:</span>
                  <p className="text-pastel-darkText font-mono">${payment.net_amount.toFixed(2)}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-pastel-muted">No PayPal capture records found.</p>
            )}
          </div>
        </div>

        {/* SECTION D: AI Diagnosis & Plain-Language Summary */}
        {verification?.ai_explanation && (
          <div className="p-4 rounded-xl bg-pastel-card border border-pastel-lavenderBorder shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pastel-lavenderBg text-pastel-lavenderText">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-pastel-darkText">AI Diagnosis & Plain Language Explanation</h4>
              </div>
              <span className="text-[11px] font-mono text-pastel-lavenderText bg-pastel-lavenderBg px-2 py-0.5 rounded border border-pastel-lavenderBorder">
                Google ADK (Gemini 3.5 Flash)
              </span>
            </div>

            <p className="text-sm text-pastel-darkText leading-relaxed bg-pastel-lavenderBg/50 p-3 rounded-xl border border-pastel-lavenderBorder">
              {verification.ai_explanation.summary}
            </p>

            {/* Reasons Bullets */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-pastel-subText">Key Evidence Points:</span>
              <ul className="space-y-1 text-xs text-pastel-darkText">
                {verification.ai_explanation.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-pastel-lavenderSolid font-bold mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Next Steps */}
            {verification.ai_explanation.recommended_next_steps?.length > 0 && (
              <div className="pt-2 border-t border-pastel-border flex items-center gap-2 text-xs text-pastel-subText">
                <strong className="text-pastel-darkText">Recommended Next Steps:</strong>
                <span>{verification.ai_explanation.recommended_next_steps.join(' • ')}</span>
              </div>
            )}
          </div>
        )}

        {/* SECTION E: Ground-Truth Evidence Panel */}
        {verification?.evidence && verification.evidence.length > 0 && (
          <div className="p-4 rounded-xl bg-pastel-card border border-pastel-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-pastel-muted uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-pastel-skySolid" /> Transparent Evidence Log
              </h4>
              <span className="text-xs text-pastel-muted font-mono">
                {verification.evidence.length} Evidence Items Captured
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-pastel-border text-pastel-muted font-medium bg-pastel-bg">
                    <th className="py-2 px-2.5 font-mono">ID</th>
                    <th className="py-2 px-2.5">Field</th>
                    <th className="py-2 px-2.5">Verified Value</th>
                    <th className="py-2 px-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pastel-border/60 font-mono">
                  {verification.evidence.map((ev) => (
                    <tr key={ev.id} className="hover:bg-pastel-bg/50">
                      <td className="py-2 px-2.5 text-pastel-skySolid font-bold">{ev.id}</td>
                      <td className="py-2 px-2.5 text-pastel-darkText">{ev.field}</td>
                      <td className="py-2 px-2.5 text-pastel-darkText font-semibold">{ev.value}</td>
                      <td className="py-2 px-2.5 text-pastel-subText font-sans">{ev.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION F: AI Claim Auditor Panel */}
        {verification?.auditor_result && (
          <div className="p-4 rounded-xl bg-pastel-card border border-pastel-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-pastel-lavenderSolid" />
                <h4 className="text-xs font-bold text-pastel-darkText uppercase tracking-wider">
                  AI Claim Auditor & Fact-Checker
                </h4>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  verification.auditor_result.verification_status === 'PASSED'
                    ? 'bg-pastel-mintBg text-pastel-mintText border border-pastel-mintBorder'
                    : 'bg-pastel-amberBg text-pastel-amberText border border-pastel-amberBorder'
                }`}
              >
                Audit {verification.auditor_result.verification_status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-pastel-mintBg border border-pastel-mintBorder">
                <span className="text-pastel-subText block mb-1">Supported & Verified Claims</span>
                <span className="font-bold text-pastel-mintText text-lg">
                  {verification.auditor_result.supported_claims?.length || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-pastel-lavenderBg border border-pastel-lavenderBorder">
                <span className="text-pastel-subText block mb-1">Unsupported Claims Removed</span>
                <span className="font-bold text-pastel-lavenderText text-lg">
                  {verification.auditor_result.claims_removed_count || 0}
                </span>
              </div>
            </div>

            {/* Rejection details if any */}
            {verification.auditor_result.rejected_claims?.length > 0 && (
              <div className="p-3 rounded-xl bg-pastel-roseBg border border-pastel-roseBorder space-y-1.5 text-xs">
                <span className="font-semibold text-pastel-roseText">Filtered Statements:</span>
                {verification.auditor_result.rejected_claims.map((rej, i) => (
                  <div key={i} className="text-pastel-darkText text-[11px] pl-2 border-l-2 border-pastel-roseBorder">
                    <p className="line-through text-pastel-muted italic">"{rej.original_claim}"</p>
                    <p className="text-pastel-roseText font-medium">Reason: {rej.reason_for_rejection}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION G: Merchant Actions & Customer Draft */}
        <div className="p-4 rounded-xl bg-pastel-card border border-pastel-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-pastel-darkText uppercase tracking-wider flex items-center gap-2">
              <Send className="h-4 w-4 text-pastel-skySolid" /> Merchant Actions & Customer Notification
            </h4>
            <span className="text-[11px] text-pastel-muted">Human Approval Required</span>
          </div>

          {/* Customer draft box */}
          {verification?.ai_explanation?.customer_message_draft && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-pastel-subText">
                <span>Customer Notification Draft:</span>
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 text-pastel-skySolid hover:text-sky-800 font-semibold"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-pastel-mintSolid" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied to clipboard' : 'Copy Draft'}
                </button>
              </div>
              <div className="p-3 rounded-xl bg-pastel-bg border border-pastel-border text-xs text-pastel-darkText font-sans">
                {verification.ai_explanation.customer_message_draft}
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-pastel-subText">
              Suggested: <strong className="text-pastel-darkText">{verdict === 'SHIP' ? 'Dispatch Order' : verdict === 'HOLD' ? 'Apply Fulfillment Hold' : 'Manual Review'}</strong>
            </div>
            <button
              onClick={handleTriggerAction}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-sm ${
                verdict === 'SHIP'
                  ? 'bg-pastel-mintSolid hover:bg-emerald-600'
                  : verdict === 'HOLD'
                  ? 'bg-pastel-roseSolid hover:bg-rose-600'
                  : 'bg-pastel-amberSolid hover:bg-amber-600'
              }`}
            >
              <span>Review & Approve Merchant Action</span>
            </button>
          </div>
        </div>

        {/* Action History Log */}
        {actionHistory && actionHistory.length > 0 && (
          <div className="p-4 rounded-xl bg-pastel-card border border-pastel-border shadow-sm space-y-2.5">
            <h4 className="text-xs font-bold text-pastel-muted uppercase tracking-wider">
              Merchant Action Audit Trail ({actionHistory.length})
            </h4>
            <div className="space-y-2">
              {actionHistory.map((act) => (
                <div key={act.id} className="p-2.5 rounded-xl bg-pastel-bg border border-pastel-border text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-pastel-darkText">{act.action_type}</span>
                    <p className="text-[11px] text-pastel-subText">{act.proposed_action}</p>
                    {act.execution_result && (
                      <p className="text-[11px] text-pastel-mintText font-mono mt-0.5">{act.execution_result}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pastel-skyBg text-pastel-skyText border border-pastel-skyBorder">
                      {act.status}
                    </span>
                    <p className="text-[10px] text-pastel-muted mt-1">
                      {new Date(act.executed_at || act.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Payload Accordion */}
        <div className="border-t border-pastel-border pt-3">
          <button
            onClick={() => setShowRawPayload(!showRawPayload)}
            className="flex items-center gap-1.5 text-xs text-pastel-muted hover:text-pastel-darkText font-mono"
          >
            {showRawPayload ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>{showRawPayload ? 'Hide Raw PayPal Payload' : 'Inspect Raw PayPal JSON'}</span>
          </button>
          {showRawPayload && (
            <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-100 border border-slate-700 text-[11px] font-mono overflow-x-auto max-h-60">
              {JSON.stringify(payment?.raw_response || {}, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
