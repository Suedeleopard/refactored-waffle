export type ProbeResult = "valid" | "invalid" | "unreachable";

/**
 * Auth headers for a Supabase key. Legacy keys are JWTs (eyJ…) and may also go
 * in the Authorization header; the newer publishable/secret keys (sb_…) are NOT
 * JWTs and 401 if sent as a Bearer token — so they go in `apikey` only.
 */
export function supabaseKeyHeaders(key: string): Record<string, string> {
  const headers: Record<string, string> = { apikey: key };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  return headers;
}

/**
 * Probe whether a key can talk to a project's Data API.
 *
 * We query a deliberately NONEXISTENT table rather than the /rest/v1/ schema
 * root. The gateway checks the key BEFORE the table is resolved, so:
 *   - invalid key  → 401 (rejected at the gateway)
 *   - valid key    → 404 (authenticated; table just doesn't exist)
 * This mirrors exactly how the app authenticates (it only ever hits tables),
 * is independent of whether the migration has been run, and avoids the schema
 * root — which can return 401 for the public role even when the key is valid.
 */
export async function probeSupabaseKey(url: string, key: string): Promise<ProbeResult> {
  // Guard against SSRF — only ever probe a Supabase host.
  try {
    if (!/\.supabase\.(co|in|net)$/.test(new URL(url).hostname)) return "unreachable";
  } catch {
    return "unreachable";
  }

  const endpoint = `${url}/rest/v1/_tsc_setup_keycheck?select=id&limit=1`;
  let res: Response;
  try {
    res = await fetch(endpoint, { headers: supabaseKeyHeaders(key) });
  } catch {
    return "unreachable";
  }
  // Only the gateway rejecting the key produces 401. Anything else (200, or a
  // 404/400 "table not found") means the key authenticated successfully.
  if (res.status === 401) return "invalid";
  return "valid";
}
