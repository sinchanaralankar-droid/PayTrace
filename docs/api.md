# PayTrace REST API Documentation

Base URL: `http://localhost:8000/api`

---

## Endpoints

### 1. `GET /api/health`
Checks server status, PayPal Sandbox OAuth connectivity, and Google Gemini model readiness.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "app_name": "PayTrace – Ship or Hold?",
  "version": "1.0.0",
  "paypal_sandbox": {
    "configured": true,
    "live_connected": true,
    "base_url": "https://api-m.sandbox.paypal.com",
    "client_id_prefix": "BAAcXTiq..."
  },
  "gemini_model": "gemini-3.5-flash",
  "has_gemini_key": true,
  "timestamp": "2026-11-05T10:45:00Z"
}
```

---

### 2. `GET /api/orders`
List orders with filtering and search.

**Query Parameters:**
- `verdict` (optional): `ALL`, `SHIP`, `HOLD`, `ASK`
- `search` (optional): string query matching order ID, customer name, email, product

---

### 3. `GET /api/orders/{order_id}`
Get order details, PayPal payment telemetry, latest verification, and action history.

---

### 4. `POST /api/orders/{order_id}/verify`
Executes the Google ADK multi-agent verification pipeline on the order.

**Response (200 OK):**
```json
{
  "id": 1,
  "order_id": "ORD-1001",
  "verdict": "SHIP",
  "rule_triggered": "RULE_ALL_CHECKS_PASSED_SHIP",
  "expected_amount": 49.99,
  "captured_amount": 49.99,
  "currency": "USD",
  "payment_status": "COMPLETED",
  "findings": [...],
  "evidence": [
    {"id": "E1", "field": "order.total", "value": "49.99 USD"},
    {"id": "E3", "field": "capture.status", "value": "COMPLETED"}
  ],
  "ai_explanation": {
    "verdict": "SHIP",
    "summary": "Payment of 49.99 USD for Order ORD-1001 has been successfully captured...",
    "reasons": ["Payment capture is COMPLETED and funds are secured [E3]"],
    "evidence_cited": ["E1", "E3"]
  },
  "auditor_result": {
    "verification_status": "PASSED",
    "supported_claims": [...],
    "rejected_claims": [],
    "claims_removed_count": 0
  }
}
```

---

### 5. `POST /api/orders/{order_id}/actions/preview`
Returns a safe preview of the recommended merchant action.

---

### 6. `POST /api/orders/{order_id}/actions/approve`
Approves and logs a merchant action.

**Request Body:**
```json
{
  "action_type": "FULFILL_ORDER",
  "customer_message": "Your order has been verified and shipped!",
  "custom_note": "Approved by Operations Lead"
}
```

---

### 7. `GET /api/dashboard/stats`
Returns aggregated KPI statistics for the merchant dashboard.
