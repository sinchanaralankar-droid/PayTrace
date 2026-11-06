import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { ActionPreview } from '../types';

interface ActionModalProps {
  preview: ActionPreview | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actionType: string, customerMessage: string, customNote: string) => Promise<void>;
  isSubmitting: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  preview,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  if (!isOpen || !preview) return null;

  const [customerMessage, setCustomerMessage] = useState(preview.customer_message_draft || '');
  const [customNote, setCustomNote] = useState('');
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleApprove = async () => {
    if (!hasConfirmed) return;
    await onConfirm(preview.action_type, customerMessage, customNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-pastel-card border border-pastel-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-pastel-border flex items-center justify-between bg-pastel-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pastel-skyBg text-pastel-skyText border border-pastel-skyBorder">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-pastel-darkText text-base">Merchant Action Confirmation</h3>
              <p className="text-xs text-pastel-muted font-mono">Order {preview.order_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-pastel-muted hover:text-pastel-darkText hover:bg-pastel-bg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-pastel-bg border border-pastel-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-pastel-subText">Proposed Action:</span>
              <span className="font-bold text-pastel-darkText font-mono">{preview.action_type}</span>
            </div>
            <p className="text-sm font-semibold text-pastel-darkText">{preview.proposed_action}</p>
            <div className="text-xs text-pastel-subText">
              Safety Level:{' '}
              <span
                className={`font-bold ${
                  preview.safety_level === 'SAFE' ? 'text-pastel-mintText' : 'text-pastel-amberText'
                }`}
              >
                {preview.safety_level}
              </span>
            </div>
          </div>

          {/* Customer message field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-pastel-darkText">Customer Notification (Optional):</label>
            <textarea
              rows={3}
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-pastel-bg border border-pastel-border text-xs text-pastel-darkText placeholder-pastel-muted focus:outline-none focus:border-pastel-skySolid transition"
              placeholder="Message to notify customer..."
            />
          </div>

          {/* Custom internal note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-pastel-darkText">Merchant Audit Note:</label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-pastel-bg border border-pastel-border text-xs text-pastel-darkText placeholder-pastel-muted focus:outline-none focus:border-pastel-skySolid transition"
              placeholder="e.g. Approved by Operations Lead after reviewing PayPal capture"
            />
          </div>

          {/* Safety Checkbox */}
          <div className="p-3 rounded-xl bg-pastel-amberBg border border-pastel-amberBorder flex items-start gap-2.5">
            <input
              type="checkbox"
              id="confirmCheck"
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-pastel-border text-pastel-skySolid focus:ring-pastel-skySolid"
            />
            <label htmlFor="confirmCheck" className="text-xs text-pastel-amberText select-none cursor-pointer">
              I have reviewed the PayPal transaction evidence and explicitly authorize this merchant decision. PayTrace will never execute financial actions without human approval.
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-pastel-border bg-pastel-card flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-pastel-subText hover:text-pastel-darkText hover:bg-pastel-bg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={!hasConfirmed || isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-pastel-skySolid hover:bg-sky-700 text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? 'Executing...' : 'Confirm & Execute Action'}
          </button>
        </div>
      </div>
    </div>
  );
};
