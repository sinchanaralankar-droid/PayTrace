import json
import sys
from pathlib import Path

# Ensure backend root is in python path
backend_dir = str(Path(__file__).resolve().parent.parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database.database import get_connection, upsert_payment
from app.database.models import OrderModel, PaymentModel
from app.verification.rule_engine import verify_payment

SIX_CASES = [
    {
        "order": {
            "id": "ORD-1001",
            "customer_name": "Asha Rao",
            "customer_email": "asha.rao@example.com",
            "product_name": "Noise-Canceling Wireless Headphones",
            "expected_amount": 49.99,
            "currency": "USD",
            "paypal_order_id": "PAY-1001",
            "invoice_id": "ORD-1001"
        },
        "payment": {
            "paypal_order_id": "PAY-1001",
            "capture_id": "CAP-PAY-1001",
            "payment_status": "COMPLETED",
            "capture_status": "COMPLETED",
            "captured_amount": 49.99,
            "currency": "USD",
            "refund_amount": 0.0,
            "paypal_fee": 1.75,
            "net_amount": 48.24,
            "invoice_id": "ORD-1001",
            "source": "paypal_sandbox",
            "raw_response": {
                "id": "PAY-1001",
                "status": "COMPLETED",
                "purchase_units": [{
                    "amount": {"currency_code": "USD", "value": "49.99"},
                    "payments": {
                        "captures": [{
                            "id": "CAP-PAY-1001",
                            "status": "COMPLETED",
                            "amount": {"currency_code": "USD", "value": "49.99"},
                            "invoice_id": "ORD-1001",
                            "seller_receivable_breakdown": {
                                "gross_amount": {"currency_code": "USD", "value": "49.99"},
                                "paypal_fee": {"currency_code": "USD", "value": "1.75"},
                                "net_amount": {"currency_code": "USD", "value": "48.24"}
                            }
                        }],
                        "refunds": []
                    }
                }]
            }
        }
    },
    {
        "order": {
            "id": "ORD-1002",
            "customer_name": "Ravi Kumar",
            "customer_email": "ravi.kumar@example.com",
            "product_name": "Mechanical RGB Gaming Keyboard",
            "expected_amount": 120.00,
            "currency": "USD",
            "paypal_order_id": "PAY-1002",
            "invoice_id": "ORD-1002"
        },
        "payment": {
            "paypal_order_id": "PAY-1002",
            "capture_id": "CAP-PAY-1002",
            "payment_status": "APPROVED",
            "capture_status": "PENDING",
            "captured_amount": 120.00,
            "currency": "USD",
            "refund_amount": 0.0,
            "paypal_fee": 0.0,
            "net_amount": 120.00,
            "invoice_id": "ORD-1002",
            "source": "paypal_sandbox",
            "raw_response": {
                "id": "PAY-1002",
                "status": "APPROVED",
                "purchase_units": [{
                    "amount": {"currency_code": "USD", "value": "120.00"},
                    "payments": {
                        "captures": [{
                            "id": "CAP-PAY-1002",
                            "status": "PENDING",
                            "amount": {"currency_code": "USD", "value": "120.00"},
                            "invoice_id": "ORD-1002",
                            "status_details": {"reason": "PENDING_REVIEW"}
                        }],
                        "refunds": []
                    }
                }]
            }
        }
    },
    {
        "order": {
            "id": "ORD-1003",
            "customer_name": "Meera Nair",
            "customer_email": "meera.nair@example.com",
            "product_name": "Ergonomic Anti-Fatigue Desk Mat",
            "expected_amount": 80.00,
            "currency": "USD",
            "paypal_order_id": "PAY-1003",
            "invoice_id": "ORD-1003"
        },
        "payment": {
            "paypal_order_id": "PAY-1003",
            "capture_id": "CAP-PAY-1003",
            "payment_status": "COMPLETED",
            "capture_status": "COMPLETED",
            "captured_amount": 50.00,
            "currency": "USD",
            "refund_amount": 0.0,
            "paypal_fee": 1.75,
            "net_amount": 48.25,
            "invoice_id": "ORD-1003",
            "source": "paypal_sandbox",
            "raw_response": {
                "id": "PAY-1003",
                "status": "COMPLETED",
                "purchase_units": [{
                    "amount": {"currency_code": "USD", "value": "50.00"},
                    "payments": {
                        "captures": [{
                            "id": "CAP-PAY-1003",
                            "status": "COMPLETED",
                            "amount": {"currency_code": "USD", "value": "50.00"},
                            "invoice_id": "ORD-1003",
                            "seller_receivable_breakdown": {
                                "gross_amount": {"currency_code": "USD", "value": "50.00"},
                                "paypal_fee": {"currency_code": "USD", "value": "1.75"},
                                "net_amount": {"currency_code": "USD", "value": "48.25"}
                            }
                        }],
                        "refunds": []
                    }
                }]
            }
        }
    },
    {
        "order": {
            "id": "ORD-1004",
            "customer_name": "Kiran Shah",
            "customer_email": "kiran.shah@example.com",
            "product_name": "Dual 4K USB-C Docking Station",
            "expected_amount": 35.50,
            "currency": "USD",
            "paypal_order_id": "PAY-1004",
            "invoice_id": "ORD-1004"
        },
        "payment": {
            "paypal_order_id": "PAY-1004",
            "capture_id": "CAP-PAY-1004",
            "payment_status": "COMPLETED",
            "capture_status": "REFUNDED",
            "captured_amount": 35.50,
            "currency": "USD",
            "refund_amount": 35.50,
            "paypal_fee": 0.0,
            "net_amount": 0.0,
            "invoice_id": "ORD-1004",
            "source": "paypal_sandbox",
            "raw_response": {
                "id": "PAY-1004",
                "status": "COMPLETED",
                "purchase_units": [{
                    "amount": {"currency_code": "USD", "value": "35.50"},
                    "payments": {
                        "captures": [{
                            "id": "CAP-PAY-1004",
                            "status": "REFUNDED",
                            "amount": {"currency_code": "USD", "value": "35.50"},
                            "invoice_id": "ORD-1004"
                        }],
                        "refunds": [{
                            "id": "REF-PAY-1004",
                            "status": "COMPLETED",
                            "amount": {"currency_code": "USD", "value": "35.50"}
                        }]
                    }
                }]
            }
        }
    },
    {
        "order": {
            "id": "ORD-1005",
            "customer_name": "Neha Iyer",
            "customer_email": "neha.iyer@example.com",
            "product_name": "Dimmable LED Desk Lamp",
            "expected_amount": 60.00,
            "currency": "USD",
            "paypal_order_id": "PAY-1005",
            "invoice_id": "ORD-1005"
        },
        "payment": {
            "paypal_order_id": "PAY-1005",
            "capture_id": "CAP-PAY-1005",
            "payment_status": "COMPLETED",
            "capture_status": "COMPLETED",
            "captured_amount": 60.00,
            "currency": "USD",
            "refund_amount": 0.0,
            "paypal_fee": 2.05,
            "net_amount": 57.95,
            "invoice_id": "ORD-9999",  # Mismatch!
            "source": "paypal_sandbox",
            "raw_response": {
                "id": "PAY-1005",
                "status": "COMPLETED",
                "purchase_units": [{
                    "amount": {"currency_code": "USD", "value": "60.00"},
                    "payments": {
                        "captures": [{
                            "id": "CAP-PAY-1005",
                            "status": "COMPLETED",
                            "amount": {"currency_code": "USD", "value": "60.00"},
                            "invoice_id": "ORD-9999"
                        }],
                        "refunds": []
                    }
                }]
            }
        }
    },
    {
        "order": {
            "id": "ORD-1006",
            "customer_name": "Arjun Das",
            "customer_email": "arjun.das@example.com",
            "product_name": "Ultra-Wide Monitor Light Bar",
            "expected_amount": 75.00,
            "currency": "USD",
            "paypal_order_id": "PAY-1006",
            "invoice_id": "ORD-1006"
        },
        "payment": {
            "paypal_order_id": "PAY-1006",
            "capture_id": "CAP-PAY-1006",
            "payment_status": "COMPLETED",
            "capture_status": "COMPLETED",
            "captured_amount": 75.00,
            "currency": "EUR",  # Currency mismatch!
            "refund_amount": 0.0,
            "paypal_fee": 2.50,
            "net_amount": 72.50,
            "invoice_id": "ORD-1006",
            "source": "paypal_sandbox",
            "raw_response": {
                "id": "PAY-1006",
                "status": "COMPLETED",
                "purchase_units": [{
                    "amount": {"currency_code": "EUR", "value": "75.00"},
                    "payments": {
                        "captures": [{
                            "id": "CAP-PAY-1006",
                            "status": "COMPLETED",
                            "amount": {"currency_code": "EUR", "value": "75.00"},
                            "invoice_id": "ORD-1006"
                        }],
                        "refunds": []
                    }
                }]
            }
        }
    }
]

def seed_database():
    with get_connection() as conn:
        for case in SIX_CASES:
            o = case["order"]
            p = case["payment"]
            conn.execute("""
                INSERT OR REPLACE INTO orders (
                    id, customer_name, customer_email, product_name,
                    expected_amount, currency, paypal_order_id, invoice_id, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            """, (
                o["id"], o["customer_name"], o["customer_email"], o["product_name"],
                o["expected_amount"], o["currency"], o["paypal_order_id"], o["invoice_id"]
            ))
            
            p_model = PaymentModel(
                paypal_order_id=p["paypal_order_id"],
                capture_id=p["capture_id"],
                payment_status=p["payment_status"],
                capture_status=p["capture_status"],
                captured_amount=p["captured_amount"],
                currency=p["currency"],
                refund_amount=p["refund_amount"],
                paypal_fee=p["paypal_fee"],
                net_amount=p["net_amount"],
                invoice_id=p["invoice_id"],
                raw_response=json.dumps(p["raw_response"]),
                source=p["source"]
            )
            upsert_payment(p_model, conn=conn)

            # Pre-compute and save initial deterministic verification so every order has its canonical verdict immediately
            v_res = verify_payment(o, p)
            summary = v_res.get("findings", [{}])[0].get("reason", f"Order {o['id']} verified with verdict {v_res['verdict']}")
            conn.execute("""
                INSERT INTO verifications (
                    order_id, verdict, rule_triggered, findings_json, evidence_json,
                    ai_explanation_json, auditor_result_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            """, (
                o["id"],
                v_res["verdict"],
                v_res.get("rule_triggered", ""),
                json.dumps(v_res.get("findings", [])),
                json.dumps(v_res.get("evidence", [])),
                json.dumps({
                    "verdict": v_res["verdict"],
                    "summary": summary,
                    "reasons": [f["reason"] for f in v_res.get("findings", [])],
                    "evidence_cited": [e["id"] for e in v_res.get("evidence", [])],
                    "recommended_next_steps": ["Proceed with warehouse dispatch" if v_res["verdict"] == "SHIP" else "Review customer inquiry"],
                    "customer_message_draft": f"Your order {o['id']} status is {v_res['verdict']}."
                }),
                json.dumps({
                    "audited_verdict": v_res["verdict"],
                    "accuracy_rate": 1.0,
                    "unsupported_claims_removed": 0,
                    "verified_claims": [f["reason"] for f in v_res.get("findings", [])],
                    "rejected_claims": []
                })
            ))

        conn.commit()
    print("Database successfully seeded with 6 demonstration cases and initial verifications.")

if __name__ == "__main__":
    seed_database()
