from typing import Dict, Any, List

def prepare_merchant_action(raw_facts: Dict[str, Any], verified_explanation: Dict[str, Any]) -> Dict[str, Any]:
    """
    Agent 5: Merchant Action Agent
    Responsibilities:
    - Prepares customer notification drafts for HOLD or ASK orders.
    - Recommends appropriate merchant actions.
    - Formulates previewable actions with safety levels.
    - CRITICAL: Never auto-executes financial actions. Requires human approval.
    """
    verdict = raw_facts["verdict"]
    order_id = raw_facts["order_id"]
    rule_triggered = raw_facts.get("rule_triggered", "")

    customer_msg = verified_explanation.get("customer_message_draft", "")
    
    if verdict == "SHIP":
        action_type = "FULFILL_ORDER"
        proposed_action = "Approve shipment and generate dispatch label."
        safety_level = "SAFE"
        can_execute = True
        reasons = [
            "Payment is 100% completed and verified in PayPal Sandbox.",
            "Order reference and amount fully match expected total.",
            "No active refund or hold detected."
        ]
        prompt = f"Confirm fulfilling and shipping Order {order_id}."
    elif verdict == "HOLD":
        if "RULE_REFUND" in rule_triggered:
            action_type = "CANCEL_ORDER_REFUNDED"
            proposed_action = "Cancel shipment because payment was refunded."
            safety_level = "REQUIRES_CAUTION"
            can_execute = True
            reasons = ["Payment was refunded in PayPal Sandbox and no longer covers the order."]
            prompt = f"Confirm cancelling shipment for refunded Order {order_id}."
        elif "RULE_AMOUNT" in rule_triggered:
            action_type = "REQUEST_PAYMENT_BALANCE"
            proposed_action = "Notify customer of partial payment and hold shipment."
            safety_level = "REQUIRES_CAUTION"
            can_execute = True
            reasons = ["Gross captured amount is lower than expected order total."]
            prompt = f"Send payment shortfall notification to customer for Order {order_id}."
        else:
            action_type = "HOLD_PENDING_SETTLEMENT"
            proposed_action = "Hold shipment until PayPal Sandbox clears funds."
            safety_level = "REQUIRES_CAUTION"
            can_execute = True
            reasons = ["Transaction status is PENDING or under PayPal review."]
            prompt = f"Confirm placing shipment on hold for Order {order_id}."
    else:  # ASK
        action_type = "MANUAL_REFERENCE_VERIFY"
        proposed_action = "Flag order for merchant manager manual reference check."
        safety_level = "REQUIRES_CAUTION"
        can_execute = True
        reasons = ["Invoice ID or currency requires human operator verification."]
        prompt = f"Flag Order {order_id} for merchant manual invoice reconciliation."

    return {
        "order_id": order_id,
        "action_type": action_type,
        "proposed_action": proposed_action,
        "safety_level": safety_level,
        "can_execute": can_execute,
        "reasons": reasons,
        "confirmation_prompt": prompt,
        "customer_message_draft": customer_msg
    }
