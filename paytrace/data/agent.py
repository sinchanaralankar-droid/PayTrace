import json
 
from google.adk.agents import Agent, SequentialAgent
from google.adk.tools.tool_context import ToolContext
 
from .checker import load_order, load_payment, run_checks
 
# Use the same model name that `adk create` put in your original agent.py.
MODEL = "gemini-3.5-flash"
 
 
def check_order(order_id: str, tool_context: ToolContext) -> dict:
    """Looks up an order and its PayPal payment, runs the rule checks, and returns the facts.
 
    Args:
        order_id: The order ID, for example ORD-1001.
    """
    order = load_order(order_id)
    if order is None:
        result = {
            "order_id": order_id,
            "verdict": "ASK",
            "findings": [{"check": "order_found", "result": "ASK",
                          "reason": "No order with this ID exists.", "evidence": ["E1"]}],
            "evidence": [{"id": "E1", "field": "order", "value": "not found"}],
        }
    else:
        result = run_checks(order, load_payment(order["payment_id"]))
    tool_context.state["case_facts"] = json.dumps(result, indent=2)
    return result
 
 
lookup_agent = Agent(
    name="lookup_agent",
    model=MODEL,
    description="Finds the order and payment and runs the rule checks.",
    instruction=(
        "The user message contains an order ID like ORD-1001. "
        "Call check_order with that ID exactly once. "
        "Then reply with only: Checks done."
    ),
    tools=[check_order],
)
 
explainer_agent = Agent(
    name="explainer_agent",
    model=MODEL,
    description="Explains the check results in plain language.",
    instruction="""You write a short case file for a shop owner. Use ONLY these facts.
 
CASE FACTS:
{case_facts}
 
Rules:
- The verdict is already decided by code. Copy it exactly. Never change it.
- Never invent amounts, dates, IDs or PayPal behaviour that is not in the facts.
- Use simple English.
 
Format:
Verdict: <SHIP, HOLD or ASK>
Why:
- one bullet per finding that is not OK, ending with its evidence IDs like [E3]
- if every finding is OK, one bullet saying everything matches, with the evidence IDs
What to verify: one or two short steps for the merchant
Customer message: a polite 2-3 sentence draft, only if the verdict is HOLD or ASK
""",
    output_key="draft_report",
)
 
verifier_agent = Agent(
    name="verifier_agent",
    model=MODEL,
    description="Removes any claim that the PayPal data does not support.",
    instruction="""You are a strict fact checker.
 
CASE FACTS:
{case_facts}
 
DRAFT CASE FILE:
{draft_report}
 
Check every bullet under "Why" and every number in the draft:
- Keep a claim only if it cites an evidence ID that exists in CASE FACTS and the claim matches that evidence value.
- Delete any claim you cannot prove from CASE FACTS.
- The verdict must stay exactly the same as in CASE FACTS.
 
Output the final case file in the same format as the draft. Then add a last line:
Verifier: removed N unsupported claim(s).
If N is more than 0, add a line "Removed:" listing each removed claim.
""",
)
 
root_agent = SequentialAgent(
    name="paytrace",
    description="Checks a PayPal payment against an order and says SHIP, HOLD or ASK.",
    sub_agents=[lookup_agent, explainer_agent, verifier_agent],
)
 