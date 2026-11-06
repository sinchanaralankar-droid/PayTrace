import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { DashboardStats } from '../types';

interface AccuracyChartProps {
  stats: DashboardStats | null;
}

export const AccuracyChart: React.FC<AccuracyChartProps> = ({ stats }) => {
  if (!stats) return null;

  // Donut chart data for accuracy
  const accuracyPct = stats.verification_accuracy_pct || 100;
  const errorPct = Math.max(0, 100 - accuracyPct);

  const accuracyData = [
    { name: 'Verified Claims', value: accuracyPct, color: '#10B981' },
    { name: 'Filtered Claims', value: errorPct, color: '#F43F5E' },
  ];

  // Verdict breakdown data
  const verdictData = [
    { name: 'SHIP', count: stats.ship_count, color: '#10B981', bg: '#D1FAE5' },
    { name: 'HOLD', count: stats.hold_count, color: '#F43F5E', bg: '#FFE4E6' },
    { name: 'ASK', count: stats.ask_count, color: '#F59E0B', bg: '#FEF3C7' },
  ];

  return (
    <div className="bg-pastel-card p-4 rounded-2xl border border-pastel-border shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-pastel-darkText">
            📊 Multi-Agent Verification & Accuracy Analytics
          </h3>
          <p className="text-[11px] text-pastel-subText">
            Real-time decision distribution & AI claim audit metrics
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-pastel-lavenderBg text-pastel-lavenderText border border-pastel-lavenderBorder">
          AI Claim Auditor: {stats.unsupported_claims_removed} Discarded
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: Donut Accuracy Gauge (4 Cols) */}
        <div className="md:col-span-4 flex items-center justify-center p-3 rounded-xl bg-pastel-mintBg border border-pastel-mintBorder">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accuracyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={48}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={2}
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#F43F5E" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-lg font-black text-pastel-mintText block leading-tight">
                {accuracyPct}%
              </span>
              <span className="text-[9px] uppercase font-bold text-pastel-subText">
                Accuracy
              </span>
            </div>
          </div>
          <div className="ml-3 text-xs space-y-1">
            <div className="font-bold text-pastel-darkText">Fact Accuracy Rate</div>
            <p className="text-[11px] text-pastel-subText">
              Every factual claim in the report is verified against raw PayPal evidence.
            </p>
          </div>
        </div>

        {/* Center: Verdict Distribution Bar (5 Cols) */}
        <div className="md:col-span-5 p-3 rounded-xl bg-pastel-bg border border-pastel-border">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-bold text-pastel-darkText">Shipment Decision Distribution</span>
            <span className="text-[11px] text-pastel-muted">Total: {stats.total_orders} Orders</span>
          </div>

          <div className="space-y-2">
            {verdictData.map((v) => {
              const pct = stats.total_orders > 0 ? Math.round((v.count / stats.total_orders) * 100) : 0;
              return (
                <div key={v.name} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5" style={{ color: v.color }}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: v.color }} />
                      {v.name}
                    </span>
                    <span className="text-pastel-darkText">
                      {v.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: v.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Summary Highlights (3 Cols) */}
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-1 gap-2">
          <div className="p-2.5 rounded-xl bg-pastel-lavenderBg border border-pastel-lavenderBorder">
            <span className="text-[10px] uppercase font-bold text-pastel-lavenderText block">
              Filtered Hallucinations
            </span>
            <span className="text-xl font-black text-pastel-lavenderSolid block">
              {stats.unsupported_claims_removed}
            </span>
            <span className="text-[10px] text-pastel-subText">Stripped by AI Auditor</span>
          </div>

          <div className="p-2.5 rounded-xl bg-pastel-skyBg border border-pastel-skyBorder">
            <span className="text-[10px] uppercase font-bold text-pastel-skyText block">
              Sandbox Mode
            </span>
            <span className="text-sm font-black text-pastel-skySolid block">
              {stats.sandbox_mode === 'LIVE' ? 'ACTIVE LIVE' : 'SYNTHETIC'}
            </span>
            <span className="text-[10px] text-pastel-subText">Zero risk testing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
