// ─────────────────────────────────────────────────────────────────────────────
//  WHOP CONFIGURATION — env-driven wiring between the template and a live
//  Whop business (account, plan ids, leads product).
//
//  Nothing here is hardcoded: every Whop identifier comes from the environment
//  so swapping businesses = swapping env vars.
// ─────────────────────────────────────────────────────────────────────────────

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

export const whopEnv = {
  apiKey: env("WHOP_API_KEY"),
  accountId: env("WHOP_ACCOUNT_ID"),
  sandbox: env("WHOP_SANDBOX") === "true",
  leadProductId: env("WHOP_LEAD_PRODUCT_ID"),
  webhookSecret: env("WHOP_WEBHOOK_SECRET"),
  appUrl: env("APP_URL"),
  planIds: {
    inspection: env("WHOP_PLAN_ID_INSPECTION"),
    deposit: env("WHOP_PLAN_ID_DEPOSIT"),
    storm: env("WHOP_PLAN_ID_STORM"),
  } as Record<string, string>,
};

/** True when server-side Whop API calls (leads, invoices, tokens) are possible. */
export function whopConfigured(): boolean {
  return Boolean(whopEnv.apiKey && whopEnv.accountId);
}

/** Whop plan_ id for a given plan key, from the env var named on the plan. */
export function whopPlanId(envPlanIdName: string): string {
  return env(envPlanIdName);
}

export interface WhopRuntime {
  /** server: can call the Whop API (leads, invoices, checkout configs) */
  serverReady: boolean;
  /** client: a live plan_ id exists for this plan → mount real Elements */
  planReady: boolean;
  sandbox: boolean;
  planId: string;
}

export function whopRuntimeForPlan(planKey: string, envPlanIdName: string): WhopRuntime {
  return {
    serverReady: whopConfigured(),
    planReady: Boolean(whopPlanId(envPlanIdName)),
    sandbox: whopEnv.sandbox,
    planId: whopPlanId(envPlanIdName),
  };
}
