# PayTrace – 3-Minute Video Demo Script

**Project**: PayTrace – Ship or Hold?  
**Target Video Duration**: 2 minutes 45 seconds  
**Tone**: Confident, technical, business-focused fintech presentation

---

### [0:00 - 0:30] Hook & Problem Statement
*(Visual: Screen showing e-commerce merchant dashboard and PayPal transaction alerts)*

> **Presenter**: "Welcome to PayTrace. If you run an online store, shipping an order before PayPal funds actually clear is one of the fastest ways to lose inventory and revenue.  
> 
> Merchants frequently ship orders with pending authorizations, uncaptured partial amounts, hidden currency mismatches, or transactions that were quietly refunded.  
> 
> We built **PayTrace**—an autonomous multi-agent platform powered by **Google ADK** and **Gemini 3.5 Flash** that checks live PayPal transactions and answers one critical question: **Ship or Hold?**"

---

### [0:30 - 1:15] Architecture & Live Dashboard Walkthrough
*(Visual: PayTrace Dashboard with 6 canonical cases, showing Live PayPal Sandbox connected badge)*

> **Presenter**: "Here is our SaaS dashboard. At the top, you can see live connectivity to the **PayPal Developer Sandbox REST API** and our AI Verification metrics.
> 
> Let's look at **Case 1: Order ORD-1001**.
> Asha Rao purchased wireless headphones for $49.99. When we run our Google ADK multi-agent pipeline:
> - The **Payment Retrieval Agent** pulls live telemetry from PayPal Sandbox.
> - The **Deterministic Verification Agent** checks gross captures, currencies, and invoice references. Notice that PayPal transaction fees ($1.75) are correctly classified as informational—not an amount shortfall!
> - Result: A definitive green **SHIP** verdict!
> - The **AI Explanation Agent** gives a clear summary with verifiable citations like `[E1]` and `[E3]`.
> - And our **AI Claim Auditor** fact-checks every sentence against the ground-truth data."

---

### [1:15 - 2:00] The Critical HOLD & ASK Scenarios
*(Visual: Clicking ORD-1002, ORD-1003, and ORD-1005)*

> **Presenter**: "Now watch what happens when payment risks occur.
> - **ORD-1002**: Ravi Kumar's payment is marked **HOLD**. Why? The PayPal capture status is `PENDING` under review. PayTrace prevents premature shipment.
> - **ORD-1003**: Meera Nair paid $50.00 on an $80.00 order. PayTrace immediately flags an underpayment and marks it **HOLD**.
> - **ORD-1004**: Kiran Shah's payment was refunded in PayPal. PayTrace catches the refund and halts fulfillment.
> - **ORD-1005**: Here, the PayPal invoice reference is `ORD-9999` instead of `ORD-1005`. PayTrace flags an **ASK** verdict, requesting merchant reference reconciliation."

---

### [2:00 - 2:30] Human-in-the-Loop Financial Safeguard
*(Visual: Clicking "Review & Approve Merchant Action" and showing Action Modal)*

> **Presenter**: "Safety is our core principle:
> **The rule engine always has final authority over the AI.** 
> Furthermore, PayTrace **never** automatically issues refunds or cancels orders without human consent.
> When I click 'Review & Approve', PayTrace generates a preview with safety disclosures, drafts a polite customer message, and requires explicit merchant authorization before recording the action."

---

### [2:30 - 2:45] Conclusion & Future Roadmap
*(Visual: Showing automated test results: 12 passed in pytest, and GitHub repository)*

> **Presenter**: "PayTrace comes complete with automated pytest suites, full TypeScript code, and real PayPal Sandbox integration.  
> With Google ADK and PayPal, merchants never have to guess whether an order is safe to ship.  
> Thank you!"
