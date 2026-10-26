# Summit Ridge Roofing — Whop Websites template

A production-ready, pitch-ready roofing company website built **on Whop** end to end:
Whop **Payment Elements** for checkout (incl. card-on-file at deposit), the Whop **Leads API**
for estimate requests, the Whop **Invoices API** for the final balance, and the
**whop.track** pixel for attribution.

The money flow the template demos, top to bottom:

```
$149 inspection  ──►  $500 deposit (card on file via setup)  ──►  the job  ──►  final-balance invoice
   CheckoutElement        Payments + PaymentElement                  —            Whop Invoices API
   + ExpressCheckout      + BrandingElement (Apple Pay / Google        —          (charge stored card
   (Apple Pay / GPay)     Pay), financing (Klarna/Splitit/Afterpay)    —           or send pay link)
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Marketing site: services, money flow, service area, financing, reviews, plans, estimate form, FAQ |
| `/checkout/[planId]` | Whop Elements checkout for the 3 plans (auto sandbox simulation without credentials) |
| `/dashboard` | Owner view: leads, cards on file, invoices (bill the final balance), pixel event log |
| `/api/webhooks/whop` | Signed webhook receiver (payment.succeeded / failed, setup_intent.succeeded) |

## The three plans (required)

| Plan | Amount | Type | Whop env var |
| --- | --- | --- | --- |
| Complete Roof Inspection | $149 | one-time fee | `WHOP_PLAN_ID_INSPECTION` |
| Project Deposit | $500 | deposit, card on file | `WHOP_PLAN_ID_DEPOSIT` |
| Storm Response · Tarp & Temp Shingle | $1,250 | flat-rate service | `WHOP_PLAN_ID_STORM` |

## Whop wiring

| Feature | How it's wired |
| --- | --- |
| Checkout (non-deposit) | server mints a checkout configuration (`ch_`) via `checkoutConfigurations.create` → `<Checkout><CheckoutElement/>` / `<ExpressCheckoutElement/>`; payment verified server-side with `payments.retrieve` (`substatus === "succeeded"`) |
| Checkout (deposit, card on file) | `<Payments setupFutureUsage="off_session">` + `<PaymentElement>` + `<BrandingElement>` → `createConfirmationToken()` → server confirms with `payments.create({ confirmation_token })`; Whop vaults the card |
| Express checkout | `<ExpressCheckoutElement/>` (Apple Pay / Google Pay) under the same `Checkout` handle, tab-switched |
| Branding | `BrandingElement` (required beside every payment surface) — rendered in live and sandbox modes |
| Financing | enabled at the Whop account level (Klarna, Splitit, Afterpay…) — surfaced automatically by the elements at checkout |
| Estimate form | `POST /api/estimate` → local CRM **and** `leads.create` (Leads API) when configured |
| Final balance | `POST /api/invoices` → `invoices.create` with `collection_method: charge_automatically` (stored `pmt_`) or `send_invoice` (pay link) |
| Webhooks | `/api/webhooks/whop` verified with `unwrapWebhook` + `WHOP_WEBHOOK_SECRET`; flips local orders paid |
| Tracking | `window.whop.track` is auto-injected on Whop Websites; the wrapper fires `estimate_requested`, `service_viewed`, `deposit_started` (+ `checkout_started`, `checkout_completed`). The floating **Whop Pixel** console and the dashboard event log make every event verifiable in any environment |

### Environment variables

```bash
WHOP_API_KEY=whop_xxx            # Account API key (Developer → Account API Keys)
WHOP_ACCOUNT_ID=biz_xxx          # your business account id
WHOP_SANDBOX=false               # true → sandbox-api.whop.com (Whop sandbox account)
WHOP_PLAN_ID_INSPECTION=plan_xxx
WHOP_PLAN_ID_DEPOSIT=plan_xxx
WHOP_PLAN_ID_STORM=plan_xxx
WHOP_LEAD_PRODUCT_ID=prod_xxx    # product the estimate leads attach to
WHOP_WEBHOOK_SECRET=ws_xxx       # from the webhook you point at /api/webhooks/whop
APP_URL=https://your-route.whop.site
```

Without these, the app runs in **sandbox mode**: a faithful Whop Elements
simulation (card / Apple Pay / Google Pay / financing chips, BrandingElement,
card-on-file consent) completes the full flow against the local database, so the
template demos end to end anywhere.

## Deploying to a live whop.app / whop.site address (Whop CLI)

```bash
# 1. install + sign in
curl -fsSL https://whop.com/install.sh | sh
whop login                      # or: whop login --method api-key --apiKey whop_xxx
whop quickstart                 # pick/create the business

# 2. create the three plans + leads product (see deploy/SETUP-WHOP.md for the exact commands)
whop products create --title "Complete Roof Inspection" --visibility visible
whop variants create --product_id prod_XXX --plan_type one_time --initial_price 149.00 --visibility visible
# … same for the $500 deposit and $1,250 flat-rate storm response …

# 3. register this directory as a Whop website app and ship it
whop apps init --app_type website --name "Summit Ridge Roofing" --route summit-roofing
# (or link an existing app) then:
whop apps dev                   # local, credentials auto-injected
whop apps deploy                # build, typecheck, upload, promote → live at your route
```

Whop injects the pixel into every page served at the route (page views +
checkout events are automatic), so `whop.track` calls go live with no extra snippet.
For a custom domain, verify it as a **payment method domain** so Apple Pay /
Google Pay render (ExpressCheckoutElement requires it).

## Rebranding (no structural changes)

Everything company-specific lives in **`src/config/company.ts`** (name, phone,
services, plans & prices, service area, reviews, FAQ) and the env vars above.
Swap those two things and the entire site, checkout and dashboard rebrand —
no component or route needs to change.

## Local development

```bash
npm install
npx drizzle-kit push        # create the local tables (leads, invoices, …)
npm run dev
```

Test checkout in sandbox mode: `4242 4242 4242 4242`, any future expiry.

## Project layout

```
src/config/company.ts          # all business content (rebrand here)
src/config/whop.ts             # env-driven Whop wiring
src/lib/whop/client.ts         # @whop/sdk client (server)
src/lib/whop/track.ts          # whop.track wrapper + event relay
src/lib/invoices.ts            # invoice / payment-method helpers
src/components/…               # sections, forms, pixel console
src/components/whop/           # LiveCheckout (Elements) + SandboxCheckout
src/app/api/…                  # estimate, whop/{checkout,verify,confirm}, invoices, webhooks
src/app/checkout/[planId]      # checkout page
src/app/dashboard              # owner dashboard
```

Original code — no cloned marketplace themes.
