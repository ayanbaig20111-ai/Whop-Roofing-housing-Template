// ─────────────────────────────────────────────────────────────────────────────
//  Whop API client (server only). Built on the official @whop/sdk.
//  Reads WHOP_API_KEY / WHOP_ACCOUNT_ID / WHOP_SANDBOX from the environment.
// ─────────────────────────────────────────────────────────────────────────────
import { WhopClient, WhopEnvironment } from "@whop/sdk";
import { whopEnv, whopConfigured } from "@/config/whop";

let cached: WhopClient | undefined;

export function whopClient(): WhopClient {
  if (cached) return cached;
  cached = new WhopClient({
    token: whopEnv.apiKey,
    environment: whopEnv.sandbox ? WhopEnvironment.Sandbox : WhopEnvironment.Production,
  });
  return cached;
}

export function whopServerReady(): boolean {
  return whopConfigured();
}
