import test from "node:test";
import assert from "node:assert/strict";
import { probeSupabaseKey, supabaseKeyHeaders } from "./validate.ts";

test("legacy JWT key (eyJ…) is also sent as a Bearer token", () => {
  const h = supabaseKeyHeaders("eyJabc");
  assert.equal(h.apikey, "eyJabc");
  assert.equal(h.Authorization, "Bearer eyJabc");
});

test("new sb_ key is sent only as apikey, never as Bearer", () => {
  const h = supabaseKeyHeaders("sb_publishable_xyz");
  assert.equal(h.apikey, "sb_publishable_xyz");
  assert.equal(h.Authorization, undefined);
});

test("401 from the table query means the key is genuinely invalid", async () => {
  globalThis.fetch = async () => new Response("", { status: 401 });
  assert.equal(await probeSupabaseKey("https://x.supabase.co", "sb_publishable_x"), "invalid");
});

test("404 (table missing) means the key authenticated → valid", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ code: "PGRST205" }), { status: 404 });
  assert.equal(await probeSupabaseKey("https://x.supabase.co", "sb_publishable_x"), "valid");
});

test("200 means valid", async () => {
  globalThis.fetch = async () => new Response("[]", { status: 200 });
  assert.equal(await probeSupabaseKey("https://x.supabase.co", "sb_publishable_x"), "valid");
});

test("a network failure (bad project ID) is reported as unreachable", async () => {
  globalThis.fetch = async () => {
    throw new Error("getaddrinfo ENOTFOUND");
  };
  assert.equal(await probeSupabaseKey("https://typo.supabase.co", "sb_x"), "unreachable");
});
