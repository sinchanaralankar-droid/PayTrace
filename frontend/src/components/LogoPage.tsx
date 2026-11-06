import React from 'react';
import { ArrowLeft, Download, ShieldCheck, Palette, Layers, Sparkles, Check, ExternalLink, Zap } from 'lucide-react';

interface LogoPageProps {
  onBack: () => void;
}

export const LogoPage: React.FC<LogoPageProps> = ({ onBack }) => {
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null);

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1800);
  };

  const colors = [
    { name: 'PayTrace Royal Blue', hex: '#1E60F2', role: 'Primary Brand Color', bg: 'bg-[#1E60F2]', text: 'text-white' },
    { name: 'Pastel Mint (SHIP)', hex: '#10B981', role: 'Clean & Cleared Payments', bg: 'bg-[#10B981]', text: 'text-white' },
    { name: 'Pastel Rose (HOLD)', hex: '#F43F5E', role: 'Pending & Refund Risks', bg: 'bg-[#F43F5E]', text: 'text-white' },
    { name: 'Pastel Amber (ASK)', hex: '#F59E0B', role: 'Discrepancy / Review', bg: 'bg-[#F59E0B]', text: 'text-white' },
    { name: 'Pastel Lavender', hex: '#8B5CF6', role: 'AI Orchestrator (Google ADK)', bg: 'bg-[#8B5CF6]', text: 'text-white' },
    { name: 'Slate Deep Navy', hex: '#0F172A', role: 'Base Canvas & Text', bg: 'bg-[#0F172A]', text: 'text-white' },
  ];

  return (
    <div className="min-h-screen bg-pastel-bg text-pastel-darkText flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="border-b border-pastel-border bg-pastel-card sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-pastel-subText hover:text-pastel-darkText hover:bg-pastel-bg border border-pastel-border transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-5 w-px bg-pastel-border mx-1" />
            <h1 className="text-base font-extrabold text-pastel-darkText flex items-center gap-2">
              <span>PayTrace Brand & Logo Design System</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-pastel-skyBg text-pastel-skyText border border-pastel-skyBorder">
                Official Assets
              </span>
            </h1>
          </div>

          <a
            href="/logo.png"
            download="PayTrace-Logo.png"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-pastel-skySolid hover:bg-sky-700 shadow-sm transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download High-Res Logo</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* Hero Section: Logo Presentation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Primary Logo Showcase (7 cols) */}
          <div className="lg:col-span-7 bg-pastel-card p-6 sm:p-8 rounded-3xl border border-pastel-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-pastel-muted">
                  Official Primary Emblem
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-pastel-skyBg text-pastel-skyText border border-pastel-skyBorder">
                  PNG & SVG Vector
                </span>
              </div>
              <h2 className="text-2xl font-black text-pastel-darkText mb-2">
                The PayTrace Symbol
              </h2>
              <p className="text-xs text-pastel-subText max-w-lg mb-6 leading-relaxed">
                The PayTrace brand mark merges the letter <strong>"P"</strong> with an integrated <strong>trajectory arrow</strong> that loops continuously through verification checkpoint gates—visualizing the rapid <em>"Ship or Hold?"</em> payment audit decision flow.
              </p>
            </div>

            {/* Logo Display Hero Card */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-blue-600/20 bg-gradient-to-tr from-[#1E60F2] via-[#2563EB] to-[#3B82F6] p-10 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="PayTrace Official Logo"
                className="max-h-56 max-w-full object-contain drop-shadow-md rounded-xl hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between text-xs text-pastel-muted pt-4 border-t border-pastel-border">
              <span>Aspect Ratio: 1:1 Vector Standard</span>
              <span>Trademark: Registered PayPal AI Hackathon 2026 Asset</span>
            </div>
          </div>

          {/* Design Rationale & Semantics (5 cols) */}
          <div className="lg:col-span-5 bg-pastel-card p-6 sm:p-8 rounded-3xl border border-pastel-border shadow-sm flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pastel-lavenderText mb-3">
                <Sparkles className="h-4 w-4 text-pastel-lavenderSolid" /> Symbol Anatomy & Meaning
              </div>
              <h3 className="text-lg font-black text-pastel-darkText mb-4">
                Designed for Fintech Trust & Speed
              </h3>

              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-pastel-skyBg border border-pastel-skyBorder">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-pastel-skySolid" />
                    <h4 className="text-xs font-bold text-pastel-skyText">1. The Dynamic "P" Monogram</h4>
                  </div>
                  <p className="text-[11px] text-pastel-subText leading-relaxed">
                    Represents PayPal ecosystem connectivity and Payment Protection assurance.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-pastel-mintBg border border-pastel-mintBorder">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-pastel-mintSolid" />
                    <h4 className="text-xs font-bold text-pastel-mintText">2. The Horizontal Arrow Flow</h4>
                  </div>
                  <p className="text-[11px] text-pastel-subText leading-relaxed">
                    Symbolizes the green-lighted <strong>SHIP</strong> decision: orders that pass all deterministic checks are propelled forward into instant fulfillment.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-pastel-amberBg border border-pastel-amberBorder">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-pastel-amberSolid" />
                    <h4 className="text-xs font-bold text-pastel-amberText">3. The Continuous Loop</h4>
                  </div>
                  <p className="text-[11px] text-pastel-subText leading-relaxed">
                    Visualizes automated telemetry tracing—cross-checking invoice IDs, captured amounts, currencies, and refund events in real time.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-pastel-lavenderBg border border-pastel-lavenderBorder text-xs text-pastel-lavenderText">
              <strong className="block mb-1">Google ADK Integration:</strong>
              Reflects the autonomous multi-agent pipeline orchestrating Gemini 3.5 Flash and deterministic rule verification.
            </div>
          </div>
        </div>

        {/* Color Palette Section */}
        <div className="bg-pastel-card p-6 sm:p-8 rounded-3xl border border-pastel-border shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pastel-muted">
                <Palette className="h-4 w-4 text-pastel-skySolid" /> Official Pastel Solid Brand Colors
              </div>
              <h3 className="text-lg font-black text-pastel-darkText mt-1">
                Color Palette & HEX Tokens
              </h3>
            </div>
            <span className="text-xs text-pastel-subText">Click any color card to copy HEX</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {colors.map((c) => (
              <div
                key={c.hex}
                onClick={() => copyHex(c.hex)}
                className="p-3.5 rounded-2xl border border-pastel-border bg-pastel-bg hover:shadow-md transition cursor-pointer group"
              >
                <div className={`h-16 rounded-xl ${c.bg} mb-3 shadow-inner flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm`}>
                  {copiedColor === c.hex ? (
                    <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full text-[10px]">
                      <Check className="h-3 w-3" /> Copied
                    </span>
                  ) : null}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-pastel-darkText truncate">{c.name}</h4>
                  <div className="font-mono text-[11px] font-bold text-pastel-muted">{c.hex}</div>
                  <p className="text-[10px] text-pastel-subText truncate">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography & Design Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-pastel-card p-6 rounded-3xl border border-pastel-border shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-pastel-darkText flex items-center gap-2">
              <Layers className="h-4 w-4 text-pastel-skySolid" /> Typography Stack
            </h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-pastel-bg border border-pastel-border">
                <span className="text-[10px] font-mono uppercase text-pastel-muted">Primary UI Font</span>
                <p className="text-base font-bold text-pastel-darkText font-sans">
                  Plus Jakarta Sans (Weights: 400, 500, 600, 700, 800)
                </p>
                <p className="text-xs text-pastel-subText mt-1">
                  Clean geometric sans-serif engineered for fintech clarity and high readability.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-pastel-bg border border-pastel-border">
                <span className="text-[10px] font-mono uppercase text-pastel-muted">Code & Telemetry Font</span>
                <p className="text-base font-bold text-pastel-darkText font-mono">
                  JetBrains Mono (Weights: 400, 500, 600)
                </p>
                <p className="text-xs text-pastel-subText mt-1">
                  Used for Order IDs, PayPal Capture IDs, Evidence tags [E1], and currency figures.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-pastel-card p-6 rounded-3xl border border-pastel-border shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-pastel-darkText flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-pastel-mintSolid" /> Brand Voice & Integrity Rules
            </h4>
            <ul className="space-y-2.5 text-xs text-pastel-darkText">
              <li className="flex items-start gap-2">
                <span className="text-pastel-mintSolid font-bold">✓</span>
                <span><strong>Always pair verdicts with transparent evidence:</strong> Never present a SHIP or HOLD verdict without ground-truth PayPal field citations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pastel-mintSolid font-bold">✓</span>
                <span><strong>Code has absolute authority:</strong> Never let LLM text override deterministic rule engine verdicts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pastel-mintSolid font-bold">✓</span>
                <span><strong>Human-in-the-Loop requirement:</strong> All financial and fulfillment operations must require merchant preview and confirmation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pastel-roseSolid font-bold">✗</span>
                <span><strong>Do not alter logo orientation:</strong> Keep the forward-pointing arrow aligned to denote positive fulfillment progress.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};
