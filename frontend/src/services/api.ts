import {
  Order,
  VerificationResponse,
  ActionPreview,
  DashboardStats,
  SandboxStatus,
  MerchantActionRecord,
  SoundboxStatus,
  SoundboxBroadcast
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchSandboxStatus(): Promise<SandboxStatus> {
  const res = await fetch(`${API_BASE}/sandbox/status`);
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  return res.json();
}

export async function fetchOrders(verdict?: string, search?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (verdict && verdict !== 'ALL') params.append('verdict', verdict);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/orders?${params.toString()}`);
  return res.json();
}

export async function fetchOrderDetails(orderId: string): Promise<{
  order: Order;
  payment: any;
  latest_verification: VerificationResponse | null;
  action_history: MerchantActionRecord[];
}> {
  const res = await fetch(`${API_BASE}/orders/${orderId}`);
  if (!res.ok) throw new Error(`Failed to load order ${orderId}`);
  return res.json();
}

export async function verifyOrder(orderId: string): Promise<VerificationResponse> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Verification failed for order ${orderId}`);
  return res.json();
}

export async function previewAction(orderId: string): Promise<ActionPreview> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/actions/preview`, {
    method: 'POST',
  });
  return res.json();
}

export async function approveAction(
  orderId: string,
  actionType: string,
  customerMessage?: string,
  customNote?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/actions/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action_type: actionType,
      customer_message: customerMessage,
      custom_note: customNote,
    }),
  });
  return res.json();
}


export async function sendChatMessage(
  message: string,
  orderId?: string,
  history?: any[]
): Promise<{ reply: string; cited_orders: string[]; suggested_questions: string[] }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      order_id: orderId,
      conversation_history: history,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Server returned error ${res.status}`);
  }
  return res.json();
}

export async function fetchSoundboxStatus(): Promise<SoundboxStatus> {
  const res = await fetch(`${API_BASE}/soundbox/status`);
  return res.json();
}

export async function broadcastSoundbox(
  orderId: string,
  eventType?: string
): Promise<SoundboxBroadcast> {
  const res = await fetch(`${API_BASE}/soundbox/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: orderId,
      event_type: eventType,
    }),
  });
  return res.json();
}
