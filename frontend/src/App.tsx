import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { OrderList } from './components/OrderList';
import { OrderDetail } from './components/OrderDetail';
import { ActionModal } from './components/ActionModal';
import { SandboxModal } from './components/SandboxModal';
import { SoundboxModal } from './components/SoundboxModal';
import { ChatDrawer } from './components/ChatDrawer';
import { LoginPage } from './components/LoginPage';
import { DecisionBarChart } from './components/DecisionBarChart';
import { soundbox } from './utils/soundboxAudio';
import {
  fetchOrders,
  fetchOrderDetails,
  fetchDashboardStats,
  fetchSandboxStatus,
  verifyOrder,
  approveAction,
} from './services/api';
import {
  Order,
  PaymentDetails,
  VerificationResponse,
  DashboardStats,
  SandboxStatus,
  MerchantActionRecord,
  ActionPreview
} from './types';
import { MessageSquare } from 'lucide-react';

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(() => {
    const saved = localStorage.getItem('paytrace_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ORD-1001');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [actionHistory, setActionHistory] = useState<MerchantActionRecord[]>([]);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Modals & Drawers
  const [actionModalPreview, setActionModalPreview] = useState<ActionPreview | null>(null);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);
  const [isSoundboxModalOpen, setIsSoundboxModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [autoAnnounce, setAutoAnnounce] = useState(true);

  const handleLogin = (user: { name: string; email: string; role: string }) => {
    setCurrentUser(user);
    localStorage.setItem('paytrace_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('paytrace_user');
  };

  // Load initial stats & orders
  const loadInitialData = async () => {
    try {
      const [sStatus, dStats] = await Promise.all([
        fetchSandboxStatus(),
        fetchDashboardStats(),
      ]);
      setSandboxStatus(sStatus);
      setStats(dStats);
    } catch (err) {
      console.error('Failed to load initial stats', err);
    }
  };

  const loadOrdersList = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await fetchOrders(selectedFilter, searchQuery);
      setOrders(data);
      if (!selectedOrderId && data.length > 0) {
        setSelectedOrderId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadSelectedOrderDetails = async (orderId: string, announce: boolean = false) => {
    try {
      const data = await fetchOrderDetails(orderId);
      setSelectedOrder(data.order);
      setPayment(data.payment);
      setVerification(data.latest_verification);
      setActionHistory(data.action_history || []);

      // Soundbox announcement if requested
      if (announce && autoAnnounce && data.latest_verification) {
        const v = data.latest_verification.verdict;
        if (v === 'SHIP') {
          soundbox.broadcast('success', `Payment of ${data.order.expected_amount} ${data.order.currency} received on PayPal. Order ${data.order.id} is verified to SHIP!`);
        } else if (v === 'HOLD') {
          soundbox.broadcast('alert', `Warning: Payment for Order ${data.order.id} is on HOLD.`);
        }
      }
    } catch (err) {
      console.error(`Failed to load order ${orderId}`, err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadOrdersList();
    }
  }, [currentUser, selectedFilter, searchQuery]);

  useEffect(() => {
    if (currentUser && selectedOrderId) {
      loadSelectedOrderDetails(selectedOrderId, false);
    }
  }, [currentUser, selectedOrderId]);

  const handleRunVerify = async () => {
    if (!selectedOrderId) return;
    setIsVerifying(true);
    try {
      const result = await verifyOrder(selectedOrderId);
      setVerification(result);
      loadOrdersList();
      loadInitialData();

      // Soundbox audio announcement on verification
      if (autoAnnounce) {
        if (result.verdict === 'SHIP') {
          soundbox.broadcast('success', `Payment verified on PayPal! Order ${result.order_id} is cleared to SHIP.`);
        } else if (result.verdict === 'HOLD') {
          soundbox.broadcast('alert', `Alert: Order ${result.order_id} placed on HOLD.`);
        } else {
          soundbox.broadcast('notice', `Notice: Order ${result.order_id} flagged for review.`);
        }
      }
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmAction = async (actionType: string, customerMessage: string, customNote: string) => {
    if (!selectedOrderId) return;
    setIsSubmittingAction(true);
    try {
      await approveAction(selectedOrderId, actionType, customerMessage, customNote);
      await loadSelectedOrderDetails(selectedOrderId, false);
      loadInitialData();
    } catch (err) {
      console.error('Action approval failed', err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // If not logged in, render pastel Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-pastel-bg flex flex-col font-sans relative">
      <Header
        sandboxStatus={sandboxStatus}
        onOpenSandboxModal={() => setIsSandboxModalOpen(true)}
        onOpenSoundboxModal={() => setIsSoundboxModalOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        onRefreshAll={() => {
          loadInitialData();
          loadOrdersList();
          if (selectedOrderId) loadSelectedOrderDetails(selectedOrderId, false);
        }}
        isRefreshing={isLoadingOrders}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Metrics: 4 Clean Cards */}
        <StatsBar
          stats={stats}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />

        {/* Shipment Decision & Accuracy Bar Graph Analytics */}
        <DecisionBarChart stats={stats} />

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Order Table (5 Cols) */}
          <div className="lg:col-span-5">
            <OrderList
              orders={orders}
              selectedOrderId={selectedOrderId}
              onSelectOrder={(id) => {
                setSelectedOrderId(id);
                loadSelectedOrderDetails(id, true);
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
              isLoading={isLoadingOrders}
            />
          </div>

          {/* Right Column: Order Decision & Telemetry Details (7 Cols) */}
          <div className="lg:col-span-7">
            <OrderDetail
              order={selectedOrder}
              payment={payment}
              verification={verification}
              actionHistory={actionHistory}
              isVerifying={isVerifying}
              onRunVerify={handleRunVerify}
              onOpenActionModal={(preview) => setActionModalPreview(preview)}
            />
          </div>
        </div>
      </main>

      {/* Floating Chat Copilot Trigger Button (Bottom-Right) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1E60F2] text-white shadow-xl hover:bg-blue-700 transition hover:scale-105 active:scale-95"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400" />
          </span>
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs font-bold">Ask AI Copilot</span>
        </button>
      )}

      {/* Interactive AI Copilot Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        selectedOrder={selectedOrder}
      />

      {/* Payment Soundbox Hub Modal */}
      <SoundboxModal
        isOpen={isSoundboxModalOpen}
        onClose={() => setIsSoundboxModalOpen(false)}
        autoAnnounce={autoAnnounce}
        onToggleAutoAnnounce={(val) => {
          setAutoAnnounce(val);
          soundbox.enabled = val;
        }}
      />

      {/* Action Approval Confirmation Modal */}
      <ActionModal
        preview={actionModalPreview}
        isOpen={Boolean(actionModalPreview)}
        onClose={() => setActionModalPreview(null)}
        onConfirm={handleConfirmAction}
        isSubmitting={isSubmittingAction}
      />

      {/* Sandbox Diagnostics Modal */}
      <SandboxModal
        status={sandboxStatus}
        isOpen={isSandboxModalOpen}
        onClose={() => setIsSandboxModalOpen(false)}
      />
    </div>
  );
};
