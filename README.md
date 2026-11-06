# 🛡️ PayTrace – Ship or Hold?
> **AI-Powered Payment Verification & Merchant Shipment Decision Platform**  
> *Built for the PayPal AI Hackathon 2026 with Google Agent Development Kit (ADK) & Gemini 3.5 Flash*

[![Google ADK](https://img.shields.io/badge/Google%20ADK-2.13.0-4285F4?style=flat&logo=google)](https://github.com/google/adk)
[![PayPal REST API](https://img.shields.io/badge/PayPal-Sandbox%20REST%20v2-003087?style=flat&logo=paypal)](https://developer.paypal.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary

Every day, e-commerce merchants lose millions to fraudulent payment claims, uncaptured authorizations, pending reviews, partial payments, and hidden currency shortfalls. Merchants mistakenly ship orders before actual funds settle in their PayPal account.

**PayTrace** solves this with an autonomous multi-agent pipeline powered by **Google ADK** and **Gemini 3.5 Flash**. Before fulfilling an order, PayTrace inspects the transaction in the **PayPal Sandbox REST API** and produces one of three high-confidence verdicts:

- 🟢 **SHIP**: Payment is 100% captured, verified, and matches the order amount, currency, and invoice reference.
- 🔴 **HOLD**: Payment is pending, held for review, partially captured, refunded, or invalid.
- 🟡 **ASK**: Payment evidence contains discrepancies or ambiguous invoice references requiring merchant review.

Every decision is backed by **verifiable evidence items (`[E1]`, `[E2]`)**, an **independent AI Claim Auditor** that deletes hallucinated statements, and a **strict Human-in-the-Loop approval safeguard**.

---

## 🏗️ Multi-Agent Architecture (Google ADK)

PayTrace uses a 6-agent sequential orchestration pattern:

```
[ Merchant Order ]
       │
       ▼
┌──────────────────────────────────────────────┐
│ 1. Payment Retrieval Agent                   │
│   • Fetches order & PayPal Sandbox data     │
│   • Normalizes telemetry & captures          │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 2. Payment Verification Agent (RULE ENGINE)  │
│   • 100% Deterministic Python verification   │
│   • Compares gross amounts, status, currency │
│   • FINAL VERDICT AUTHORITY (SHIP/HOLD/ASK) │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 3. AI Explanation Agent (Gemini 3.5 Flash)   │
│   • Translates raw facts into merchant prose │
│   • Cites exact evidence tags [E1], [E2]     │
│   • Drafts polite customer message           │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 4. AI Claim Auditor Agent (Fact Checker)     │
│   • Audits explanation against raw facts     │
│   • Removes unproven claims or hallucinations│
│   • Protects merchant from false AI trust    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 5. Merchant Action Agent                     │
│   • Generates previewable fulfillment action │
│   • Strict human approval gate               │
│   • Never auto-executes financial actions    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 6. Root Orchestrator (PayTrace Coordinator) │
│   • Coordinates agents & writes audit logs   │
│   • Streams decision payload to UI           │
└──────────────────────────────────────────────┘
```

> **Deterministic Verdict Supremacy**: The rule engine—not the LLM—has final authority over the payment verdict. The AI Explainer only translates findings into merchant-friendly prose, and the AI Claim Auditor strips any statement that contradicts or lacks raw PayPal evidence.

---

## 🧪 The Six Canonical Demonstration Scenarios

PayTrace comes seeded with six production test cases:

| Case ID | Customer | Scenario | Expected Verdict | Triggered Rule / Reason |
|:---|:---|:---|:---:|:---|
| **ORD-1001** | Asha Rao | Clean Payment ($49.99 USD) | **SHIP** | `RULE_ALL_CHECKS_PASSED_SHIP`: Gross captured amount matches order total; status COMPLETED; invoice ID matches. |
| **ORD-1002** | Ravi Kumar | Pending Review ($120.00 USD) | **HOLD** | `RULE_CAPTURE_STATUS_HOLD`: PayPal capture is PENDING (`PENDING_REVIEW`). Funds not guaranteed. |
| **ORD-1003** | Meera Nair | Partial Capture ($50.00 of $80.00) | **HOLD** | `RULE_AMOUNT_MATCH_HOLD`: Underpayment detected. Customer paid $50.00 on $80.00 order. |
| **ORD-1004** | Kiran Shah | Refunded Payment ($35.50 USD) | **HOLD** | `RULE_REFUND_STATUS_HOLD`: Payment refunded via PayPal; balance no longer covers goods. |
| **ORD-1005** | Neha Iyer | Reference Mismatch (ORD-9999) | **ASK** | `RULE_REFERENCE_MATCH_ASK`: PayPal invoice ID (`ORD-9999`) does not match merchant order ID (`ORD-1005`). |
| **ORD-1006** | Arjun Das | Currency Mismatch (EUR vs USD) | **HOLD** | `RULE_CURRENCY_MATCH_HOLD`: Payment captured in EUR (€75.00) for USD order ($75.00). Also confirms fee breakdown clarity. |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ and npm
- PayPal Developer Sandbox Account (Credentials configured in `.env`)
- Google Gemini API Key

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment (or use existing .venv)
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and GOOGLE_API_KEY
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Build or run in dev mode
npm run dev
```

### 3. Run Automated Tests
```bash
# In backend directory:
pytest tests/ -v
```
*(All 12 backend unit and integration tests pass with 100% rate).*

---

## 🔒 Security & Disclosures

- **PayPal Sandbox Only**: PayTrace operates exclusively against the PayPal Sandbox environment (`https://api-m.sandbox.paypal.com`).
- **Synthetic Data**: All customer identities, emails, and order items are synthetic test fixtures.
- **Human-in-the-Loop Financial Safety**: PayTrace **never** automatically issues refunds, captures payments, or alters financial ledgers. Every merchant action requires explicit preview and confirmation in the UI.
- **AI Model Disclosure**: AI explanations are generated using `gemini-3.5-flash` via Google GenAI / ADK. Fact auditing is performed by a dedicated auditor agent before presenting to the merchant.
- **Disclaimer**: This project was created for the PayPal AI Hackathon 2026. It is not an official product of PayPal Inc. or Google LLC.

---

## 📄 License
Released under the [MIT License](LICENSE).
