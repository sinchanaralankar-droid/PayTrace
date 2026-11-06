import React from 'react';
import { PackageCheck, PauseCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsBarProps {
  stats: DashboardStats | null;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  selectedFilter,
  onSelectFilter,
}) => {
  if (!stats) return null;

  const cards = [
    {
      id: 'ALL',
      label: 'Total Orders',
      value: stats.total_orders,
      icon: PackageCheck,
      borderColor: selectedFilter === 'ALL' ? 'border-sky-500 ring-2 ring-sky-200 bg-pastel-skyBg' : 'border-pastel-border bg-pastel-card',
      badgeBg: 'bg-pastel-skyBg text-pastel-skyText',
      badgeBorder: 'border-pastel-skyBorder',
      textColor: 'text-pastel-darkText',
    },
    {
      id: 'SHIP',
      label: 'SHIP Orders',
      value: stats.ship_count,
      icon: CheckCircle2,
      borderColor: selectedFilter === 'SHIP' ? 'border-emerald-500 ring-2 ring-emerald-200 bg-pastel-mintBg' : 'border-pastel-border bg-pastel-card',
      badgeBg: 'bg-pastel-mintBg text-pastel-mintText',
      badgeBorder: 'border-pastel-mintBorder',
      textColor: 'text-pastel-mintText',
      subtext: 'Payment verified & ready',
    },
    {
      id: 'HOLD',
      label: 'HOLD Orders',
      value: stats.hold_count,
      icon: PauseCircle,
      borderColor: selectedFilter === 'HOLD' ? 'border-rose-500 ring-2 ring-rose-200 bg-pastel-roseBg' : 'border-pastel-border bg-pastel-card',
      badgeBg: 'bg-pastel-roseBg text-pastel-roseText',
      badgeBorder: 'border-pastel-roseBorder',
      textColor: 'text-pastel-roseText',
      subtext: 'Pending, refunded or partial',
    },
    {
      id: 'ASK',
      label: 'ASK Orders',
      value: stats.ask_count,
      icon: HelpCircle,
      borderColor: selectedFilter === 'ASK' ? 'border-amber-500 ring-2 ring-amber-200 bg-pastel-amberBg' : 'border-pastel-border bg-pastel-card',
      badgeBg: 'bg-pastel-amberBg text-pastel-amberText',
      badgeBorder: 'border-pastel-amberBorder',
      textColor: 'text-pastel-amberText',
      subtext: 'Ambiguous, manual review',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        const isClickable = ['ALL', 'SHIP', 'HOLD', 'ASK'].includes(c.id);

        return (
          <div
            key={c.id}
            onClick={() => isClickable && onSelectFilter(c.id)}
            className={`p-4 rounded-2xl border transition-all shadow-sm ${
              c.borderColor
            } ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-slate-400' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-pastel-muted uppercase tracking-wider">
                {c.label}
              </span>
              <div className={`p-1.5 rounded-xl border ${c.badgeBg} ${c.badgeBorder}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl font-black tracking-tight ${c.textColor}`}>{c.value}</div>
            {c.subtext && <div className="text-[11px] text-pastel-subText mt-1 truncate">{c.subtext}</div>}
          </div>
        );
      })}
    </div>
  );
};
