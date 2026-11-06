import React, { useState } from 'react';
import { Volume2, VolumeX, Radio, Battery, Zap, CheckCircle2, AlertCircle, X, Play } from 'lucide-react';
import { soundbox } from '../utils/soundboxAudio';

interface SoundboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoAnnounce: boolean;
  onToggleAutoAnnounce: (enabled: boolean) => void;
}

export const SoundboxModal: React.FC<SoundboxModalProps> = ({
  isOpen,
  onClose,
  autoAnnounce,
  onToggleAutoAnnounce,
}) => {
  if (!isOpen) return null;

  const [volume, setVolume] = useState(soundbox.volume * 100);
  const [isConnected, setIsConnected] = useState(true);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [recentBroadcast, setRecentBroadcast] = useState<string | null>(null);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundbox.volume = newVol / 100;
  };

  const handleTestBroadcast = async (scenario: 'SHIP' | 'HOLD' | 'ASK') => {
    setIsPlayingTest(true);
    let chime: 'success' | 'alert' | 'notice' = 'success';
    let text = '';

    if (scenario === 'SHIP') {
      chime = 'success';
      text = 'Payment of 49.99 USD received on PayPal for order ORD-1001. Verified and cleared to SHIP!';
    } else if (scenario === 'HOLD') {
      chime = 'alert';
      text = 'Warning: Payment for order ORD-1002 is on HOLD due to pending PayPal review. Do not ship!';
    } else {
      chime = 'notice';
      text = 'Notice: Payment for order ORD-1005 requires manual invoice verification.';
    }

    setRecentBroadcast(text);
    await soundbox.broadcast(chime, text);
    setIsPlayingTest(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-pastel-card border border-pastel-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-pastel-border flex items-center justify-between bg-pastel-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pastel-mintBg text-pastel-mintText border border-pastel-mintBorder">
              <Radio className="h-5 w-5 text-pastel-mintSolid animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-pastel-darkText text-base">
                Payment Soundbox Hub
              </h3>
              <p className="text-xs text-pastel-subText">
                Real-Time Audio Device Pairing & Announcement Simulator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-pastel-muted hover:text-pastel-darkText hover:bg-pastel-bg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Soundbox Device Visualizer Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-pastel-skyBg via-pastel-bg to-pastel-lavenderBg border border-pastel-skyBorder flex items-center gap-4">
            {/* Device Mockup */}
            <div className="relative h-20 w-20 rounded-2xl bg-[#1E60F2] text-white flex flex-col items-center justify-center shadow-lg border-2 border-white shrink-0">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center mb-1">
                <Volume2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-sky-200">PAYTRACE</span>
              <span className="text-[8px] opacity-80">SOUNDBOX</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white" />
              </span>
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-pastel-darkText truncate">
                  PayTrace Soundbox Pro-X
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isConnected ? 'bg-pastel-mintBg text-pastel-mintText border border-pastel-mintBorder' : 'bg-slate-200 text-slate-600'}`}>
                  {isConnected ? 'ONLINE / CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <p className="text-xs text-pastel-subText">
                Simulated retail audio speaker with Web Audio chime synthesis & voice alerts.
              </p>
              <div className="flex items-center gap-3 text-[11px] text-pastel-muted pt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Battery className="h-3.5 w-3.5 text-pastel-mintSolid" /> 94% Battery
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Zap className="h-3.5 w-3.5 text-pastel-skySolid" /> Bluetooth 5.3
                </span>
              </div>
            </div>
          </div>

          {/* Volume and Auto-Announce Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Volume Slider */}
            <div className="p-3.5 rounded-xl bg-pastel-card border border-pastel-border space-y-2">
              <div className="flex items-center justify-between font-bold text-pastel-darkText">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-pastel-skySolid" /> Volume
                </span>
                <span className="font-mono">{Math.round(volume)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-pastel-skySolid cursor-pointer"
              />
            </div>

            {/* Auto Announce Toggle */}
            <div className="p-3.5 rounded-xl bg-pastel-card border border-pastel-border flex items-center justify-between">
              <div>
                <span className="font-bold text-pastel-darkText block">Auto-Announce</span>
                <span className="text-[11px] text-pastel-muted">Chime on order verification</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleAutoAnnounce(!autoAnnounce)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoAnnounce ? 'bg-pastel-mintSolid' : 'bg-slate-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoAnnounce ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          {/* Live Soundbox Audio Test Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pastel-muted block">
              🔊 Live Test Broadcasts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTestBroadcast('SHIP')}
                disabled={isPlayingTest}
                className="p-2.5 rounded-xl bg-pastel-mintBg border border-pastel-mintBorder text-left hover:bg-emerald-100 transition disabled:opacity-50"
              >
                <span className="text-xs font-bold text-pastel-mintText flex items-center gap-1">
                  <Play className="h-3 w-3" /> Test SHIP
                </span>
                <span className="text-[10px] text-pastel-subText block mt-0.5">Green chime & speech</span>
              </button>

              <button
                onClick={() => handleTestBroadcast('HOLD')}
                disabled={isPlayingTest}
                className="p-2.5 rounded-xl bg-pastel-roseBg border border-pastel-roseBorder text-left hover:bg-rose-100 transition disabled:opacity-50"
              >
                <span className="text-xs font-bold text-pastel-roseText flex items-center gap-1">
                  <Play className="h-3 w-3" /> Test HOLD
                </span>
                <span className="text-[10px] text-pastel-subText block mt-0.5">Alert warning tone</span>
              </button>

              <button
                onClick={() => handleTestBroadcast('ASK')}
                disabled={isPlayingTest}
                className="p-2.5 rounded-xl bg-pastel-amberBg border border-pastel-amberBorder text-left hover:bg-amber-100 transition disabled:opacity-50"
              >
                <span className="text-xs font-bold text-pastel-amberText flex items-center gap-1">
                  <Play className="h-3 w-3" /> Test ASK
                </span>
                <span className="text-[10px] text-pastel-subText block mt-0.5">Review notice tone</span>
              </button>
            </div>
          </div>

          {/* Recent Broadcast Speech Preview */}
          {recentBroadcast && (
            <div className="p-3 rounded-xl bg-pastel-bg border border-pastel-border text-xs text-pastel-darkText space-y-1">
              <span className="font-bold text-pastel-muted text-[10px] uppercase tracking-wider block">
                Last Audio Broadcast:
              </span>
              <p className="italic">"{recentBroadcast}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pastel-border bg-pastel-card flex justify-between items-center text-xs text-pastel-subText">
          <span>Powered by Web Audio & Web Speech API</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold bg-pastel-bg hover:bg-slate-200 text-pastel-darkText transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
