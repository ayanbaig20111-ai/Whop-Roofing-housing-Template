# Going live on Whop — step by step

Verified against Whop CLI v0.16+ and `@whop/sdk`. The CLI runs against
**production by default**; there is no dry-run mode. For test money, use a
[Whop sandbox account](https://whop.com/blog/whop-sandbox/) and
`WHOP_API_BASE_URL=https://sandbox-api.whop.com/api/v1` for CLI calls plus
`WHOP_SANDBOX=true` in the app.

## 1. Business, key, permissions

1. `whop login` (browser) or `whop login --method api-key --apiKey whop_xxx`.
2. `whop quickstart` to pick the business this template sells under.
3. In the dashboard → **Developer → Account API Keys → Create**. Grant at least:
   `plan:basic:read`, `plan:create`, `checkout_configuration:create`,
   `payment:basic:read`, `payment:charge`, `lead:manage`, `lead:basic:read`,
   `invoice:create`, `member:basic:read`, `member:email:read`,
   `developer:manage_webhook`, `webhook_receive:payments`.
4. Put the key in the environment: `WHOP_API_KEY`, and your `biz_` id in
   `WHOP_ACCOUNT_ID`.

## 2. Products & plans (the three required plans + a leads product)

```bash
whop products create --title "Complete Roof Inspection" \
  --description "21-point inspection, thermal scan, photo report. Credited toward replacement." \
  --visibility visible
# → prod_INSPECTION

whop variants create --product_id prod_INSPECTION \
  --plan_type one_time --initial_price 149.00 --visibility visible
# → plan_INSPECTION

whop products create --title "Project Deposit" \
  --description "Locks written price and start date. 100% credited to the project." \
  --visibility visible
# → prod_DEPOSIT

whop variants create --product_id prod_DEPOSIT \
  --plan_type one_time --initial_price 500.00 --visibility visible
# → plan_DEPOSIT

whop products create --title "Storm Response - Tarp and Temp Shingle" \
  --description "24/7 crew, professional tarp/temp shingle, flat rate, claim photos." \
  --visibility visible
# → prod_STORM

whop variants create --product_id prod_STORM \
  --plan_type one_time --initial_price 1250.00 --visibility visible
# → plan_STORM

# product estimate leads attach to
whop products create --title "Estimate Requests" \
  --description "Leads captured from the website estimate form." --visibility visible
# → prod_LEADS
```

Paste the ids into the environment:

```bash
WHOP_PLAN_ID_INSPECTION=plan_…
WHOP_PLAN_ID_DEPOSIT=plan_…
WHOP_PLAN_ID_STORM=plan_…
WHOP_LEAD_PRODUCT_ID=prod_…
```

## 3. Financing rails

In the dashboard → **Payments → Payment methods**, enable the installments /
BNPL methods you want (Klarna, Splitit, Afterpay…). The Whop Elements surface
them automatically at checkout for approved buyers — nothing to wire in code.

## 4. Ship the website

```bash
whop apps init --app_type website --name "Summit Ridge Roofing" --route summit-roofing
# point it at THIS codebase (the app directory is linked in whop.app.json), then:
whop apps dev
whop apps deploy            # build → typecheck → upload → promote
whop apps logs --level error --query "checkout"
```

The site is live at `summit-roofing.whop.site` (your `--route`). Whop injects
the pixel into every page, so page views, checkout events and your custom
`whop.track` events (`estimate_requested`, `service_viewed`, `deposit_started`)
start landing in the pixel dashboard (~1 minute after first visit).

Custom domain: add the domain in the dashboard and verify it as a **payment
method domain** — ExpressCheckoutElement (Apple Pay / Google Pay) renders only
on verified domains (whop.com pages are pre-approved).

## 5. Webhook

Dashboard → **Developer → Webhooks → Create**:

- URL: `https://summit-roofing.whop.site/api/webhooks/whop`
- Events: `payment.succeeded`, `payment.failed`, `setup_intent.succeeded`
- Copy the signing secret into `WHOP_WEBHOOK_SECRET`, redeploy.

The handler verifies the signature (`unwrapWebhook`) and flips the matching
local order to paid — fulfillment never trusts the browser callback.

## 6. Verify the flow (sandbox account first)

1. `/checkout/roof-inspection-149` — pay with `4242 4242 4242 4242`.
   Dashboard: invoice **paid**, pixel log shows `checkout_started` + `checkout_completed`.
2. `/` → estimate form → submit. Dashboard: lead appears (with `whopLeadId`
   when live); pixel log shows `estimate_requested`.
3. `/checkout/project-deposit-500` — check *save card*, pay. Dashboard:
   deposit invoice **paid** + a **card on file** row.
4. Dashboard → invoices → the deposit row → **Charge card**. A final-balance
   invoice is created (`charge_automatically` against the stored method) or
   **Pay link** sends it for manual payment.
5. Pixel console (bottom-right pill): all custom events fire with payloads.
