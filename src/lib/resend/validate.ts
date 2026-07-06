export type ProbeResult = "valid" | "invalid" | "unreachable";

/**
 * Probe whether a Resend API key is real and usable.
 *
 * The app only ever calls resend.emails.send(), so a key scoped to "Sending
 * access" is exactly right — and that's what the setup walkthrough tells users
 * to create. A sending-scoped key cannot read /domains (that needs Full
 * access), so we can't judge the key by the bare status code: we key off WHICH
 * error Resend returns.
 *
 *   - 2xx                     → full-access key authenticated → valid
 *   - restricted_api_key      → real key, just scoped to sending → valid
 *   - invalid/missing_api_key → key is wrong or revoked → invalid
 *
 * Distinguishing these is the whole point: a sending-scoped key (precisely what
 * we ask the user to make) must NOT be reported as rejected. Resend has
 * returned restricted_api_key under both 403 and 401, so the body's error name
 * — not the status — is the authoritative signal.
 */
export async function probeResendKey(key: string): Promise<ProbeResult> {
  let res: Response;
  try {
    res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch {
    return "unreachable";
  }

  if (res.ok) return "valid";

  let name: string | undefined;
  try {
    name = (await res.json())?.name;
  } catch {
    // Non-JSON or empty body — fall through to status-based handling.
  }

  // A restricted (sending-only) key is valid for our purposes.
  if (name === "restricted_api_key") return "valid";
  if (name === "invalid_api_key" || name === "missing_api_key" || res.status === 401) {
    return "invalid";
  }

  // Anything else (5xx, rate limit, unexpected) is a transient/unknown problem,
  // not proof the key is bad — let the wizard show a "try again" message.
  return "unreachable";
}
