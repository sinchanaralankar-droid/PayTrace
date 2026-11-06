import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { SandboxStatus } from '../types';

interface SandboxModalProps {
  status: SandboxStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SandboxModal: React.FC<SandboxModalProps> = ({ status, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-pastel-card border border-pastel-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-pastel-border flex items-center justify-between bg-pastel-card">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-pastel-skySolid" />
            <h3 className="font-bold text-pastel-darkText text-base">PayPal Sandbox Diagnostics</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-pastel-muted hover:text-pastel-darkText hover:bg-pastel-bg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between p-2.5 rounded-xl bg-pastel-bg border border-pastel-border">
              <span className="text-pastel-subText">Sandbox Endpoint:</span>
              <span className="font-mono text-pastel-darkText font-semibold">{status?.base_url || 'https://api-m.sandbox.paypal.com'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-pastel-bg border border-pastel-border">
              <span className="text-pastel-subText">OAuth 2.0 Credentials:</span>
              <span className="font-mono text-pastel-darkText font-semibold">{status?.configured ? 'Configured in .env' : 'Missing'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-pastel-bg border border-pastel-border">
              <span className="text-pastel-subText">Client ID Prefix:</span>
              <span className="font-mono text-pastel-darkText font-semibold">{status?.client_id_prefix || 'None'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-pastel-bg border border-pastel-border">
              <span className="text-pastel-subText">Live OAuth Handshake:</span>
              <span className={`font-bold ${status?.live_connected ? 'text-pastel-mintText' : 'text-pastel-amberText'}`}>
                {status?.live_connected ? '200 OK (Live Bearer Active)' : 'Simulated / Mock Mode'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-pastel-skyBg border border-pastel-skyBorder text-pastel-skyText">
            <strong className="block mb-1">Developer Sandbox Notice:</strong>
            PayTrace strictly operates in PayPal Sandbox mode with synthetic demonstration accounts. No real transactions or real customer credit cards are ever accessed or charged.
          </div>
        </div>

        <div className="p-4 border-t border-pastel-border bg-pastel-card flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-pastel-bg hover:bg-slate-200 text-pastel-darkText transition"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
