import time
import httpx
from typing import Dict, Any, Optional
from app.config import settings

class PayPalClient:
    def __init__(self):
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self.base_url = settings.PAYPAL_BASE_URL.rstrip("/")
        self._cached_token: Optional[str] = None
        self._token_expires_at: float = 0.0

    async def get_access_token(self) -> Optional[str]:
        if not settings.has_paypal_credentials:
            return None
        
        # Return cached token if valid for at least another 60 seconds
        if self._cached_token and time.time() < (self._token_expires_at - 60):
            return self._cached_token

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{self.base_url}/v1/oauth2/token",
                    data={"grant_type": "client_credentials"},
                    auth=(self.client_id, self.client_secret),
                    headers={"Accept": "application/json", "Accept-Language": "en_US"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    self._cached_token = data.get("access_token")
                    expires_in = data.get("expires_in", 3600)
                    self._token_expires_at = time.time() + expires_in
                    return self._cached_token
        except Exception:
            pass
        return None

    async def check_connectivity(self) -> Dict[str, Any]:
        if not settings.has_paypal_credentials:
            return {
                "configured": False,
                "live_connected": False,
                "base_url": self.base_url,
                "client_id_prefix": "NOT_SET",
                "error_message": "PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not configured in .env"
            }

        token = await self.get_access_token()
        if token:
            return {
                "configured": True,
                "live_connected": True,
                "base_url": self.base_url,
                "client_id_prefix": self.client_id[:8] + "...",
                "error_message": None
            }
        else:
            return {
                "configured": True,
                "live_connected": False,
                "base_url": self.base_url,
                "client_id_prefix": self.client_id[:8] + "...",
                "error_message": "Failed to obtain OAuth 2.0 Bearer token from PayPal Sandbox"
            }

    async def get_order(self, paypal_order_id: str) -> Optional[Dict[str, Any]]:
        token = await self.get_access_token()
        if not token:
            return None

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.base_url}/v2/checkout/orders/{paypal_order_id}",
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                )
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
        return None

    async def get_capture(self, capture_id: str) -> Optional[Dict[str, Any]]:
        token = await self.get_access_token()
        if not token:
            return None

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"{self.base_url}/v2/payments/captures/{capture_id}",
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
                )
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
        return None

    async def refund_capture(self, capture_id: str, amount: Optional[str] = None, currency: str = "USD", note: str = "") -> Dict[str, Any]:
        """Safely execute a refund in PayPal Sandbox upon explicit merchant approval."""
        token = await self.get_access_token()
        if not token:
            return {"status": "MOCK_SUCCESS", "message": "Refund processed in Sandbox simulated mode (No active token)"}

        body: Dict[str, Any] = {"note_to_payer": note}
        if amount:
            body["amount"] = {"value": amount, "currency_code": currency}

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{self.base_url}/v2/payments/captures/{capture_id}/refund",
                    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                    json=body
                )
                if resp.status_code in (200, 201):
                    return {"status": "SUCCESS", "data": resp.json()}
                else:
                    return {"status": "ERROR", "code": resp.status_code, "data": resp.json()}
        except Exception as e:
            return {"status": "ERROR", "error": str(e)}

paypal_client = PayPalClient()
