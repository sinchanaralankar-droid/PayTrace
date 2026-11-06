import React from 'react';
import { Search, CheckCircle, AlertTriangle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { Order, Verdict } from '../types';

interface OrderListProps {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  isLoading: boolean;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  searchQuery,
  onSearchChange,
  selectedFilter,
  onSelectFilter,
  isLoading,
}) => {
  const getVerdictBadge = (verdict?: Verdict) => {
    switch (verdict) {
      case 'SHIP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-pastel-mintBg text-pastel-mintText border border-pastel-mintBorder">
            <CheckCircle className="h-3 w-3 text-pastel-mintSolid" /> SHIP
          </span>
        );
      case 'HOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-pastel-roseBg text-pastel-roseText border border-pastel-roseBorder">
            <AlertCircle className="h-3 w-3 text-pastel-roseSolid" /> HOLD
          </span>
        );
      case 'ASK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-pastel-amberBg text-pastel-amberText border border-pastel-amberBorder">
            <AlertTriangle className="h-3 w-3 text-pastel-amberSolid" /> ASK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            <Clock className="h-3 w-3" /> PENDING
          </span>
        );
    }
  };

  return (
    <div className="bg-pastel-card rounded-2xl border border-pastel-border shadow-sm flex flex-col h-[calc(100vh-13rem)] overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-pastel-border space-y-3 bg-pastel-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pastel-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search orders, customers, products..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-pastel-bg border border-pastel-border text-sm text-pastel-darkText placeholder-pastel-muted focus:outline-none focus:border-pastel-skySolid focus:ring-1 focus:ring-pastel-skySolid transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'SHIP', 'HOLD', 'ASK'].map((tab) => (
            <button
              key={tab}
              onClick={() => onSelectFilter(tab)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === tab
                  ? 'bg-pastel-skySolid text-white shadow-sm'
                  : 'bg-pastel-bg text-pastel-subText hover:text-pastel-darkText hover:bg-slate-200/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="flex-1 overflow-y-auto divide-y divide-pastel-border/60">
        {isLoading ? (
          <div className="p-8 text-center text-pastel-subText text-sm">
            <div className="animate-spin h-6 w-6 border-2 border-pastel-skySolid border-t-transparent rounded-full mx-auto mb-2" />
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-pastel-muted text-sm">
            No orders found matching your filter criteria.
          </div>
        ) : (
          orders.map((order) => {
            const isSelected = order.id === selectedOrderId;
            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className={`p-3.5 transition cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'bg-pastel-skyBg border-l-4 border-l-pastel-skySolid'
                    : 'hover:bg-pastel-bg/80'
                }`}
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-pastel-darkText group-hover:text-pastel-skySolid transition">
                      {order.id}
                    </span>
                    {getVerdictBadge(order.latest_verdict)}
                  </div>
                  <div className="text-xs font-semibold text-pastel-darkText truncate">
                    {order.customer_name}
                  </div>
                  <div className="text-[11px] text-pastel-subText truncate">
                    {order.product_name}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <div className="font-bold text-sm text-pastel-darkText">
                      ${order.expected_amount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-pastel-muted uppercase font-mono">
                      {order.currency}
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition ${
                      isSelected ? 'text-pastel-skySolid translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
