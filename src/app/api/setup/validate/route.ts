import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { probeSupabaseKey } from "@/lib/supabase/validate";
import { probeResendKey } from "@/lib/resend/validate";

/*
  Validate submitted credentials by making a real call to each service BEFORE
  they're saved. Returns a friendly message so the wizard can show exactly
  what's wrong (bad URL, wrong key, etc.) instead of failing silently later.
*/

type Body = {
  integration: "supabase" | "stripe" | "resend";
  values: Record<string, string>;
};

export async function POST(request: NextRequest) {
  const { integration, values } = (await request.json()) as Body;

  try {
    switch (integration) {
      case "supabase":
        return NextResponse.json(await validateSupabase(values));
      case "stripe":
        return NextResponse.json(await validateStripe(values));
      case "resend":
        return NextResponse.json(await validateResend(values));
      default:
        return NextResponse.json({ ok: false, message: "Unknown integration." }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Validation failed.";
    return NextResponse.json({ ok: false, message }, { status: 200 });
  }
}

function fail(message: string) {
  return { ok: false, message };
}

async function validateSupabase(v: Record<string, string>) {
  const url = v.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const anon = v.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const service = v.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !anon) return fail("Add both the project ID and the public key.");
  if (!/^https:\/\/.+\.supabase\.(co|in|net)/.test(url)) {
    return fail("That doesn't look right — check the project ID.");
  }

  // Public key: query a nonexistent table so the gateway checks the key.
  // Works for both legacy "anon" (eyJ…) and new "publishable" (sb_…) keys.
  const anonProbe = await probeSupabaseKey(url, anon);
  if (anonProbe === "unreachable") {
    return fail("Couldn't reach your project — double-check the project ID.");
  }
  if (anonProbe === "invalid") {
    return fail("The public key didn't match. Make sure the project ID and the public key come from the same project (Settings → API).");
  }

  // Secret key: must be present, different from the public key, and valid.
  if (!service) return fail("Add the secret key too — it's needed for payments.");
  if (service === anon) {
    return fail("Both boxes have the same key. The second one needs the secret (“service_role” / “secret”) key.");
  }
  const svcProbe = await probeSupabaseKey(url, service);
  if (svcProbe === "unreachable") {
    return fail("Couldn't reach your project to check the secret key.");
  }
  if (svcProbe === "invalid") {
    return fail("The secret key didn't match. Copy the “service_role” / “secret” key from the same project.");
  }

  return { ok: true, message: "Connected to Supabase." };
}

async function validateStripe(v: Record<string, string>) {
  const secret = v.STRIPE_SECRET_KEY?.trim();
  const publishable = v.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();

  if (!secret) return fail("Add your Stripe Secret key.");
  if (publishable && !publishable.startsWith("pk_")) {
    return fail("The publishable key should start with pk_.");
  }

  const stripe = new Stripe(secret);
  try {
    await stripe.balance.retrieve();
  } catch {
    return fail("Stripe rejected that secret key. Copy it again from Developers → API keys.");
  }

  const webhook = v.STRIPE_WEBHOOK_SECRET?.trim();
  if (webhook && !webhook.startsWith("whsec_")) {
    return fail("The webhook signing secret should start with whsec_.");
  }
  const priceStarter = v.NEXT_PUBLIC_STRIPE_PRICE_STARTER?.trim();
  const pricePro = v.NEXT_PUBLIC_STRIPE_PRICE_PRO?.trim();
  for (const [name, val] of [
    ["Starter", priceStarter],
    ["Pro", pricePro],
  ] as const) {
    if (val) {
      try {
        await stripe.prices.retrieve(val);
      } catch {
        return fail(`The ${name} Price ID wasn't found in this Stripe account.`);
      }
    }
  }

  return { ok: true, message: "Connected to Stripe." };
}

async function validateResend(v: Record<string, string>) {
  const key = v.RESEND_API_KEY?.trim();
  if (!key) return fail("Add your Resend API key.");
  if (!key.startsWith("re_")) return fail("Resend keys start with re_.");

  // The app only sends email, so a "Sending access" key — what the walkthrough
  // tells users to create — is exactly right. probeResendKey treats a sending-
  // scoped key as valid instead of mistaking it for a bad one.
  const probe = await probeResendKey(key);
  if (probe === "unreachable") {
    return fail("Couldn't reach Resend just now — try again in a moment.");
  }
  if (probe === "invalid") {
    return fail("Resend didn't recognise that key. Copy it again from Resend → API Keys.");
  }

  return { ok: true, message: "Connected to Resend." };
}
