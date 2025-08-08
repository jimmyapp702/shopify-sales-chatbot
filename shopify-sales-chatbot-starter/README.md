# Shopify Sales Chatbot (Self-Hosted) — Starter

A lightweight, brandable chat widget + Next.js backend that:
- Answers **sales** questions from a policy/FAQ knowledge base (optional OpenAI).
- Handles **WISMO** and product discovery using Shopify APIs.
- **Escalates** to human support only when needed (via email by default, optional Gorgias API).

> Avoids per-ticket bot fees; you control when to escalate.

---

## 1) One-time setup

### A. Create a **Custom App** in Shopify (Admin)
1. **Settings → Apps and sales channels → Develop apps → Create an app**.
2. Under **Configuration → Admin API access scopes**, enable at minimum:
   - `read_orders`, `read_customers`, `read_fulfillments`, `read_products`
   - `write_draft_orders` (optional), `read_discounts`, `write_discounts` (optional)
3. Install the app to your store → copy the **Admin API access token**.
4. Put values in `.env` (see `.env.example`), including:
   - `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN`, `SHOPIFY_API_VERSION`.

*(Optional) Storefront API:* create a Storefront access token for product search and set
`SHOPIFY_STOREFRONT_ACCESS_TOKEN`.

### B. (Optional) OpenAI
Add `OPENAI_API_KEY` to `.env` if you want natural-language answers with sources.

### C. (Recommended) Email-based escalation (works with Gorgias inbox)
Set `SMTP_*` and `SUPPORT_ESCALATION_EMAIL`. Gorgias will create a ticket from the email.

### D. (Optional) Direct Gorgias API escalation
If you prefer direct API creation, set:
- `GORGIAS_DOMAIN`, `GORGIAS_API_USERNAME`, `GORGIAS_API_TOKEN`.

---

## 2) Local run

```bash
cp .env.example .env
# fill in the .env values
npm install
npm run dev
```

Open http://localhost:3000 to see a minimal status page. Chat UI is at `/chat`.

---

## 3) Deploy (Vercel)

1. Create a new Git repo and push this folder.
2. In **Vercel**, import your repo → Framework: Next.js.
3. Add your `.env` variables in **Vercel → Project → Settings → Environment Variables**.
4. Deploy. Your app domain will look like `https://your-app.vercel.app`.

---

## 4) Install widget on Shopify theme

Add this tag **before `</body>`** in `theme.liquid` (or via an App Embed block):
```liquid
<script defer src="https://YOUR-APP-DOMAIN/chat-widget.js"
        data-bot-brand="Your Brand"
        data-proactive="true"></script>
```

> Replace `YOUR-APP-DOMAIN` with your Vercel domain.

That’s it — a floating chat bubble will appear on your store.

---

## 5) What’s included

- `public/chat-widget.js` — small script that injects a chat bubble and panel (iframe).
- `pages/chat/index.js` — the chat UI.
- `pages/api/chat.js` — message orchestrator (routes to Shopify, KB, escalation).
- `pages/api/shopify/orderLookup.js` — WISMO endpoint.
- `pages/api/search/products.js` — product finder via Storefront API (optional).
- `pages/api/escalate/email.js` — escalation via SMTP.
- `pages/api/escalate/gorgias.js` — direct Gorgias API escalation (optional).
- `src/lib/shopify.js` — Admin/Storefront GraphQL helpers.
- `src/lib/llm.js` — optional OpenAI logic with simple KB retrieval.
- `kb/*.md` — your FAQs/policies (edit these to fit your brand).

---

## 6) Safety & guardrails

- The bot only performs *read* operations by default. Draft order/discount creation are **off** unless you enable those endpoints and scopes.
- PII minimization: only store email/order number for active session in memory. Add a DB later if you want analytics.
- Escalation triggers: by default, the **"Talk to a human"** button and low-confidence answers.

---

## 7) Next steps

- Replace sample `kb/*.md` with your policies, shipping tables, size guides.
- Tweak `src/lib/llm.js` system prompt and retrieval.
- Add your escalation routing rules (VIP tags, AOV thresholds) in `pages/api/chat.js`.
- (Optional) Add `pages/api/draft-order.js` if you want to issue pay links.

---

**Questions or want me to extend this?** Ping me and we’ll add exchanges/cancellations, offer ladders, and an admin console.
