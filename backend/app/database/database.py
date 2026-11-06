import sqlite3
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from app.config import settings
from app.database.models import OrderModel, PaymentModel, VerificationModel, MerchantActionModel

DB_PATH = settings.DATABASE_PATH

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Orders table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                product_name TEXT NOT NULL,
                expected_amount REAL NOT NULL,
                currency TEXT NOT NULL,
                paypal_order_id TEXT NOT NULL,
                invoice_id TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        # Payments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS payments (
                paypal_order_id TEXT PRIMARY KEY,
                capture_id TEXT NOT NULL,
                payment_status TEXT NOT NULL,
                capture_status TEXT NOT NULL,
                captured_amount REAL NOT NULL,
                currency TEXT NOT NULL,
                refund_amount REAL NOT NULL,
                paypal_fee REAL NOT NULL,
                net_amount REAL NOT NULL,
                invoice_id TEXT NOT NULL,
                raw_response TEXT NOT NULL,
                source TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        # Verifications table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS verifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                verdict TEXT NOT NULL,
                rule_triggered TEXT NOT NULL,
                findings_json TEXT NOT NULL,
                evidence_json TEXT NOT NULL,
                ai_explanation_json TEXT NOT NULL,
                auditor_result_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )
        """)

        # Merchant Actions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS merchant_actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                action_type TEXT NOT NULL,
                proposed_action TEXT NOT NULL,
                status TEXT NOT NULL,
                customer_message TEXT NOT NULL,
                execution_result TEXT,
                created_at TEXT NOT NULL,
                executed_at TEXT,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )
        """)
        conn.commit()

# CRUD operations
def get_order_by_id(order_id: str) -> Optional[OrderModel]:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
        if not row:
            return None
        return OrderModel(**dict(row))

def list_orders() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT o.*, 
                   v.verdict as latest_verdict,
                   v.rule_triggered as latest_rule,
                   v.created_at as last_verified_at,
                   p.payment_status,
                   p.capture_status,
                   p.source as payment_source
            FROM orders o
            LEFT JOIN payments p ON o.paypal_order_id = p.paypal_order_id
            LEFT JOIN verifications v ON v.id = (
                SELECT id FROM verifications WHERE order_id = o.id ORDER BY id DESC LIMIT 1
            )
            ORDER BY o.id ASC
        """).fetchall()
        return [dict(r) for r in rows]

def upsert_payment(payment: PaymentModel, conn: Optional[sqlite3.Connection] = None):
    sql = """
        INSERT INTO payments (
            paypal_order_id, capture_id, payment_status, capture_status,
            captured_amount, currency, refund_amount, paypal_fee, net_amount,
            invoice_id, raw_response, source, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(paypal_order_id) DO UPDATE SET
            capture_id = excluded.capture_id,
            payment_status = excluded.payment_status,
            capture_status = excluded.capture_status,
            captured_amount = excluded.captured_amount,
            currency = excluded.currency,
            refund_amount = excluded.refund_amount,
            paypal_fee = excluded.paypal_fee,
            net_amount = excluded.net_amount,
            invoice_id = excluded.invoice_id,
            raw_response = excluded.raw_response,
            source = excluded.source,
            updated_at = excluded.updated_at
    """
    params = (
        payment.paypal_order_id, payment.capture_id, payment.payment_status,
        payment.capture_status, payment.captured_amount, payment.currency,
        payment.refund_amount, payment.paypal_fee, payment.net_amount,
        payment.invoice_id, payment.raw_response, payment.source, payment.updated_at
    )
    if conn is not None:
        conn.execute(sql, params)
    else:
        with get_connection() as c:
            c.execute(sql, params)
            c.commit()

def get_payment_by_order_id(paypal_order_id: str) -> Optional[PaymentModel]:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM payments WHERE paypal_order_id = ?", (paypal_order_id,)).fetchone()
        if not row:
            return None
        return PaymentModel(**dict(row))

def save_verification(v: VerificationModel) -> int:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO verifications (
                order_id, verdict, rule_triggered, findings_json, evidence_json,
                ai_explanation_json, auditor_result_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            v.order_id, v.verdict, v.rule_triggered, v.findings_json, v.evidence_json,
            v.ai_explanation_json, v.auditor_result_json, v.created_at
        ))
        conn.commit()
        return cursor.lastrowid

def get_latest_verification(order_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        row = conn.execute("""
            SELECT * FROM verifications WHERE order_id = ? ORDER BY id DESC LIMIT 1
        """, (order_id,)).fetchone()
        if not row:
            return None
        v = VerificationModel(**dict(row))
        return v.to_dict()

def list_verifications_for_order(order_id: str) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT * FROM verifications WHERE order_id = ? ORDER BY id DESC
        """, (order_id,)).fetchall()
        return [VerificationModel(**dict(r)).to_dict() for r in rows]

def save_merchant_action(a: MerchantActionModel) -> int:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO merchant_actions (
                order_id, action_type, proposed_action, status, customer_message,
                execution_result, created_at, executed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            a.order_id, a.action_type, a.proposed_action, a.status,
            a.customer_message, a.execution_result, a.created_at, a.executed_at
        ))
        conn.commit()
        return cursor.lastrowid

def update_merchant_action_status(action_id: int, status: str, execution_result: str, executed_at: str):
    with get_connection() as conn:
        conn.execute("""
            UPDATE merchant_actions
            SET status = ?, execution_result = ?, executed_at = ?
            WHERE id = ?
        """, (status, execution_result, executed_at, action_id))
        conn.commit()

def list_actions_for_order(order_id: str) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT * FROM merchant_actions WHERE order_id = ? ORDER BY id DESC
        """, (order_id,)).fetchall()
        return [dict(r) for r in rows]
