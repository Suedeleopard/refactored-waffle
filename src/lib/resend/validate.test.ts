import test from "node:test";
import assert from "node:assert/strict";
import { probeResendKey } from "./validate.ts";

// A "Sending access" key — exactly what the setup walkthrough tells users to
// create — cannot read /domains (that needs Full access). Resend reports this
// as restricted_api_key. It must be treated as a GOOD key: it can send, which
// is all the app ever does.
test("a sending-only key (403 restricted_api_key) is valid", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ name: "restricted_api_key", statusCode: 403 }), { status: 403 });
  assert.equal(await probeResendKey("re_sending_only"), "valid");
});

// The status code for a restricted key has been seen as 401 as well as 403, so
// the body's error name — not the bare status — is the authoritative signal.
test("a restricted key returned as 401 is still valid", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ name: "restricted_api_key", statusCode: 401 }), { status: 401 });
  assert.equal(await probeResendKey("re_sending_only"), "valid");
});

test("a full-access key (200) is valid", async () => {
  globalThis.fetch = async () => new Response("{}", { status: 200 });
  assert.equal(await probeResendKey("re_full_access"), "valid");
});

test("a genuinely wrong/revoked key (401 invalid_api_key) is invalid", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ name: "invalid_api_key", statusCode: 401 }), { status: 401 });
  assert.equal(await probeResendKey("re_wrong"), "invalid");
});

test("a network failure is reported as unreachable, not as a bad key", async () => {
  globalThis.fetch = async () => {
    throw new Error("getaddrinfo ENOTFOUND");
  };
  assert.equal(await probeResendKey("re_x"), "unreachable");
});
