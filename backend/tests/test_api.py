import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.database import init_db
from app.database.seed_data import seed_database

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    init_db()
    seed_database()

client = TestClient(app)

def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "paypal_sandbox" in data

def test_orders_list():
    resp = client.get("/api/orders")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 6
    order_ids = [o["id"] for o in data]
    assert "ORD-1001" in order_ids
    assert "ORD-1006" in order_ids

def test_verify_order_1001():
    resp = client.post("/api/orders/ORD-1001/verify")
    assert resp.status_code == 200
    data = resp.json()
    assert data["order_id"] == "ORD-1001"
    assert data["verdict"] == "SHIP"

def test_preview_and_approve_action():
    resp = client.post("/api/orders/ORD-1001/actions/preview")
    assert resp.status_code == 200
    preview = resp.json()
    assert preview["safety_level"] == "SAFE"

    approve_resp = client.post(
        "/api/orders/ORD-1001/actions/approve",
        json={"action_type": preview["action_type"]}
    )
    assert approve_resp.status_code == 200
    action_data = approve_resp.json()
    assert action_data["status"] == "EXECUTED"

def test_dashboard_stats():
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    stats = resp.json()
    assert stats["total_orders"] >= 6
    assert "verification_accuracy_pct" in stats
