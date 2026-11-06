import React from 'react';
import { RefreshCw, Info, User, LogOut, Volume2, MessageSquare } from 'lucide-react';
import { SandboxStatus } from '../types';

interface HeaderProps {
  sandboxStatus: SandboxStatus | null;
  onOpenSandboxModal: () => void;
  onOpenSoundboxModal: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  currentUser: { name: string; email: string; role: string } | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sandboxStatus,
  onOpenSandboxModal,
  onOpenSoundboxModal,
  onToggleChat,
  isChatOpen,
  onRefreshAll,
  isRefreshing,
  currentUser,
  onLogout,
}) => {
  const isLive = sandboxStatus?.live_connected;

  return (
    <header className="border-b border-pastel-border bg-pastel-card/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl overflow-hidden border border-pastel-skyBorder flex items-center justify-center shadow-sm bg-[#1E60F2]"
          >
            <img src="/logo.png" alt="PayTrace Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-pastel-darkText">
              PayTrace
            </h1>
            <p className="text-xs text-pastel-subText hidden sm:block">
              AI Payment Verification & Decision Platform
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2.5">
          {/* Payment Soundbox Hub Button */}
          <button
            onClick={onOpenSoundboxModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pastel-mintBg text-pastel-mintText hover:bg-emerald-100 border border-pastel-mintBorder transition shadow-sm"
            title="Configure Payment Soundbox Hardware & Audio"
          >
            <Volume2 className="h-3.5 w-3.5 text-pastel-mintSolid" />
            <span>Soundbox: Online</span>
          </button>

          {/* AI Copilot Chat Toggle */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition shadow-sm ${
              isChatOpen
                ? 'bg-pastel-skySolid text-white border-sky-600'
                : 'bg-pastel-lavenderBg text-pastel-lavenderText hover:bg-purple-100 border-pastel-lavenderBorder'
            }`}
            title="Open AI Merchant Copilot Chat"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>AI Copilot</span>
          </button>

          {/* Live Sandbox Status Badge */}
          <button
            onClick={onOpenSandboxModal}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isLive
                ? 'bg-pastel-mintBg text-pastel-mintText border-pastel-mintBorder hover:bg-emerald-100'
                : 'bg-pastel-amberBg text-pastel-amberText border-pastel-amberBorder hover:bg-amber-100'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLive ? 'bg-pastel-mintSolid' : 'bg-pastel-amberSolid'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLive ? 'bg-pastel-mintSolid' : 'bg-pastel-amberSolid'
                }`}
              />
            </span>
            <span>Sandbox: {isLive ? 'CONNECTED' : 'SIMULATED'}</span>
            <Info className="h-3.5 w-3.5 opacity-60 ml-0.5" />
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-pastel-bg hover:bg-slate-200/70 text-pastel-darkText border border-pastel-border transition disabled:opacity-50"
            title="Refresh Orders & Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Current User Profile & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-pastel-border">
              <div className="hidden lg:block text-right text-xs">
                <span className="font-bold text-pastel-darkText block">{currentUser.name}</span>
                <span className="text-[10px] text-pastel-muted">{currentUser.role}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-pastel-roseBg text-pastel-roseText hover:bg-rose-100 border border-pastel-roseBorder transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
