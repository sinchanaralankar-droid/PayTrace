# Devpost Project Submission: PayTrace – Ship or Hold?

## Inspiration
E-commerce merchants frequently struggle with the gap between order creation and payment settlement. A customer may check out, but their payment might be pending PayPal risk review, partially captured, subject to currency conversion mismatches, or refunded shortly after placement. Fulfilling an unverified order leads to irreversible inventory loss. We created **PayTrace** to provide merchants with autonomous, transparent, and audited shipment decisions: **SHIP**, **HOLD**, or **ASK**.

## What It Does
PayTrace is an AI-powered payment verification platform that:
1. Connects to the **PayPal Sandbox REST API v2** using OAuth 2.0.
2. Cross-checks merchant orders against gross captured amounts, capture statuses, currencies, and invoice references.
3. Enforces a **deterministic rule engine** where code—not the LLM—has absolute authority over financial verdicts.
4. Uses **Google ADK** and **Gemini 3.5 Flash** to generate merchant explanations with verifiable evidence citations (`[E1]`, `[E2]`).
5. Employs an **AI Claim Auditor Agent** that fact-checks the AI explanation against raw PayPal responses, deleting unsupported statements.
6. Enforces a **Human-in-the-Loop approval gate** for all financial and fulfillment actions.

## How We Built It
- **AI Orchestration**: Google Agent Development Kit (`google-adk`), Python, Gemini 3.5 Flash (`google-genai`).
- **Backend**: Python 3.14, FastAPI, SQLite with WAL mode, HTTPX for asynchronous PayPal OAuth and REST requests.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, and Recharts.
- **Testing**: Automated Pytest suite covering all 6 demonstration cases, API endpoints, and claim auditor fact-checking.

## Challenges We Overcame
1. **Gross Amount vs. Net Settlement Confusion**: E-commerce merchants often mistake PayPal fee deductions as underpayments. We designed the rule engine to accurately verify gross captured funds while treating PayPal processing fees as informational.
2. **Preventing AI Hallucinations**: In fintech, an LLM hallucinating that a payment cleared could cause significant losses. We implemented a two-fold safeguard: the rule engine has non-negotiable authority, and an independent Claim Auditor parses citations and removes unverified assertions.
3. **Safe Sandbox Integration**: Built automated OAuth 2.0 token caching and graceful fallback to verified mock datasets to ensure 100% test reproducibility.

## Accomplishments We're Proud Of
- A complete, working production-grade full-stack application.
- 12 automated backend unit and integration tests passing with 100% rate.
- Seamless multi-agent collaboration via Google ADK.
- Clean, modern fintech SaaS user interface.

## What's Next
- Direct webhook integration with PayPal IPN / Webhooks for real-time automated updates.
- Native Shopify and WooCommerce apps powered by the PayTrace engine.
- Multi-currency dynamic hedging recommendations for cross-border merchants.
