import { NextResponse, type NextRequest } from "next/server";
import { supabaseKeyHeaders } from "@/lib/supabase/validate";

/*
  Verify the required tables exist, so the wizard can turn a silent failure
  (signup later breaks because the schema was never run) into a clear, blocking
  check. Uses the keys already entered — no extra credentials. A table query
  returns 200 when it exists and 404 when it doesn't; auth is checked first, so
  401 means the key, not the table.
*/

const REQUIRED_TABLES = ["profiles", "subscriptions"];

export async function POST(request: NextRequest) {
  const { url, key } = (await request.json()) as { url?: string; key?: string };
  const base = url?.trim().replace(/\/$/, "");
  if (!base || !key) {
    return NextResponse.json({ ok: false, message: "Connect Supabase first." }, { status: 200 });
  }

  // Only ever fetch a Supabase host — this endpoint is unauthenticated, so an
  // unchecked URL would be an SSRF vector (e.g. cloud metadata endpoints).
  let host: string;
  try {
    host = new URL(base).hostname;
  } catch {
    return NextResponse.json({ ok: false, message: "That doesn't look like a project URL." }, { status: 200 });
  }
  if (!/\.supabase\.(co|in|net)$/.test(host)) {
    return NextResponse.json({ ok: false, message: "That doesn't look like a Supabase URL." }, { status: 200 });
  }

  const missing: string[] = [];
  for (const table of REQUIRED_TABLES) {
    let res: Response;
    try {
      res = await fetch(`${base}/rest/v1/${table}?select=*&limit=0`, {
        headers: supabaseKeyHeaders(key),
      });
    } catch {
      return NextResponse.json(
        { ok: false, ready: false, message: "Couldn't reach your project — re-check the keys above." },
        { status: 200 }
      );
    }
    if (res.status === 401) {
      return NextResponse.json(
        { ok: false, ready: false, message: "Your key was rejected — re-check the keys above." },
        { status: 200 }
      );
    }
    if (res.status !== 200) missing.push(table); // 404 = table not found
  }

  const ready = missing.length === 0;
  return NextResponse.json({
    ok: true,
    ready,
    missing,
    message: ready
      ? "Your tables are set up — you're good to go."
      : `Not found yet: ${missing.join(", ")}. Run the setup code above in Supabase, then re-check.`,
  });
}
