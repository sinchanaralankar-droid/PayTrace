import json
import os
import re
from typing import Dict, Any, List
from google import genai
from app.config import settings

EXPLANATION_PROMPT_TEMPLATE = """You are an expert PayPal payment risk advisor writing a concise merchant case report.
Analyze the following payment verification facts and provide a clear, professional explanation.

ORDER & PAYMENT FACTS:
Order ID: {order_id}
Customer: {customer}
Expected Amount: {expected_amount} {currency}
Verdict Decided by Rule Engine: {verdict}
Triggered Rule: {rule_triggered}

FINDINGS:
{findings_text}

EVIDENCE:
{evidence_text}

MANDATORY RULES:
1. The verdict is already final ({verdict}). You MUST NOT change or contradict it.
2. Every factual statement or reason MUST cite at least one evidence ID (e.g. [E1], [E2], [E3]).
3. Explain why the order received {verdict} in simple, professional language.
4. If verdict is SHIP, explain that payment is completed, verified, and matches the order.
5. If verdict is HOLD, explain the specific issue (e.g. pending status, partial capture, refund, currency mismatch).
6. If verdict is ASK, explain what requires merchant manual review (e.g. reference mismatch, overpayment).
7. Suggest 1 or 2 concrete next steps for the merchant.
8. If verdict is HOLD or ASK, draft a polite, professional 2-sentence message for the customer. If SHIP, provide an order confirmation note.

Return ONLY a valid JSON object matching this schema:
{{
  "verdict": "{verdict}",
  "summary": "1-2 sentence executive summary of the payment verification result",
  "reasons": [
    "Explanation bullet citing evidence like [E3]",
    "Another explanation bullet citing [E1] and [E4]"
  ],
  "evidence_cited": ["E1", "E3"],
  "recommended_next_steps": [
    "Action step 1 for merchant",
    "Action step 2 for merchant"
  ],
  "customer_message_draft": "Polite message to send to customer"
}}
"""

def generate_fallback_explanation(case_facts: Dict[str, Any]) -> Dict[str, Any]:
    verdict = case_facts["verdict"]
    order_id = case_facts["order_id"]
    findings = case_facts.get("findings", [])
    
    reasons = []
    cited = set()
    for f in findings:
        ev_ids = f.get("evidence", [])
        for eid in ev_ids:
            cited.add(eid)
        cites_str = " ".join(f"[{e}]" for e in ev_ids)
        reasons.append(f"{f['reason']} {cites_str}".strip())

    if verdict == "SHIP":
        summary = f"Order {order_id} is verified and fully funded in PayPal Sandbox. It is cleared for immediate shipment."
        next_steps = ["Proceed to pack and ship the order", "Mark order as fulfilled in store management"]
        customer_msg = f"Thank you for your order! Your payment for order {order_id} has been verified and your items are being prepared for shipment."
    elif verdict == "HOLD":
        summary = f"Order {order_id} cannot be shipped because payment status is on hold or amounts/currency do not match."
        next_steps = ["Do not ship order items until payment clears", "Review transaction details in PayPal Merchant Dashboard"]
        customer_msg = f"Hello, we noticed that your payment for order {order_id} is currently held or incomplete in PayPal. Please verify your payment method so we can fulfill your order."
    else:
        summary = f"Order {order_id} requires merchant review due to reference or amount discrepancy."
        next_steps = ["Verify invoice reference against customer PayPal receipt", "Contact customer if discrepancy cannot be confirmed"]
        customer_msg = f"Hello, we are currently reviewing payment details for order {order_id}. We will update you as soon as verification is complete."

    return {
        "verdict": verdict,
        "summary": summary,
        "reasons": reasons,
        "evidence_cited": list(cited),
        "recommended_next_steps": next_steps,
        "customer_message_draft": customer_msg
    }

async def generate_explanation(case_facts: Dict[str, Any], order_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Agent 3: AI Explanation Agent
    Uses Gemini to generate transparent, merchant-friendly explanations referencing exact evidence tags.
    """
    if not settings.has_gemini_credentials:
        return generate_fallback_explanation(case_facts)

    findings_text = "\n".join(
        f"- [{f['result']}] {f['check']}: {f['reason']} (Evidence: {', '.join(f.get('evidence', []))})"
        for f in case_facts.get("findings", [])
    )
    evidence_text = "\n".join(
        f"- {e['id']}: {e['field']} = {e['value']} ({e.get('description', '')})"
        for e in case_facts.get("evidence", [])
    )

    prompt = EXPLANATION_PROMPT_TEMPLATE.format(
        order_id=case_facts["order_id"],
        customer=order_info.get("customer_name", "Customer"),
        expected_amount=case_facts["expected_amount"],
        currency=case_facts["currency"],
        verdict=case_facts["verdict"],
        rule_triggered=case_facts["rule_triggered"],
        findings_text=findings_text,
        evidence_text=evidence_text,
    )

    try:
        client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        response = client.models.generate_content(
            model=settings.GOOGLE_GENAI_MODEL,
            contents=prompt,
        )
        text = response.text.strip()
        # Clean markdown formatting if present
        text = re.sub(r"^```json\s*", "", text)
        text = re.sub(r"^```\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        data = json.loads(text)
        
        # Ensure verdict matches rule engine
        data["verdict"] = case_facts["verdict"]
        return data
    except Exception:
        return generate_fallback_explanation(case_facts)
