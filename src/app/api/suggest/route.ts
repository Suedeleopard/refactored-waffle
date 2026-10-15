import { NextResponse } from "next/server";
import { env } from "@/lib/env";

/*
  Suggestions for the Remix Board.

  Two deliberately different jobs:

    "question" — a provocation the room answers themselves. Short, cheap, and
      it keeps the facilitator in charge. This is the mode worth keeping.
    "idea"     — a finished idea. Costs more, and tends to make the room go
      quiet because there is nothing left to do. Here so the difference can
      be felt rather than argued about.

  Every failure returns a clean JSON error. The board treats any failure as
  "hide the buttons" and carries on from the seeded library, so a flaky call
  mid-session is invisible to the room.
*/

const MODEL = "claude-haiku-5-5";
const MAX_FIELD = 400;

/** Crude per-instance throttle. Serverless makes this leaky, but it stops the
 *  obvious case of someone holding down a button and spending real money. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, MAX_FIELD) : "";
}

async function ask(system: string, user: string, maxTokens: number): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.anthropicApiKey!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    throw new Error(`anthropic ${res.status}`);
  }
  const data = await res.json();
  const text = data?.content?.find((c: { type: string }) => c.type === "text")?.text;
  if (typeof text !== "string") throw new Error("no text in response");
  return text.trim();
}

export async function POST(request: Request) {
  if (!env.anthropicApiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "slow_down" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const kind = clean(body.kind);

  try {
    /* ── The audience card ──────────────────────────────────────────────── */
    if (kind === "avatar") {
      const business = clean(body.business);
      if (!business) return NextResponse.json({ error: "bad_request" }, { status: 400 });

      const text = await ask(
        `You sketch the customer a business wants to attract, for a live creative workshop.
Return ONLY a JSON object with exactly these string keys: age, lives, values, follows, weekend.
Each value is one short phrase, under 15 words, concrete and specific. UK English.
No markdown, no code fences, no commentary. Write the aspirational customer the business
wants more of, not the one it already has.`,
        `Business: ${business}`,
        400
      );

      // The model is told to return bare JSON, but strip fences defensively.
      const json = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      try {
        const parsed = JSON.parse(json);
        return NextResponse.json({ fields: parsed });
      } catch {
        return NextResponse.json({ error: "unparseable" }, { status: 502 });
      }
    }

    /* ── One row of the board ───────────────────────────────────────────── */
    if (kind === "spark") {
      const business = clean(body.business);
      const industry = clean(body.industry);
      const behaviour = clean(body.behaviour);
      const mode = clean(body.mode) === "idea" ? "idea" : "question";
      if (!business || !behaviour) {
        return NextResponse.json({ error: "bad_request" }, { status: 400 });
      }

      const system =
        mode === "question"
          ? `You help a facilitator run a live idea session. Given a behaviour from one
industry, write ONE short provocative question that makes the room invent the
equivalent for a different business. Under 15 words. UK English.
Ask a question — never supply the answer, never name a solution.
Return only the question, no quotes, no preamble.`
          : `You help a facilitator run a live idea session. Given a behaviour from one
industry, write ONE concrete thing the other business could do that borrows it.
Under 20 words. UK English. Give it a name if a name fits.
Return only the idea, no quotes, no preamble.`;

      const text = await ask(
        system,
        `Business: ${business}\nBorrowing from: ${industry || "another industry"}\nTheir behaviour: ${behaviour}`,
        mode === "question" ? 80 : 120
      );

      return NextResponse.json({ text: text.replace(/^["']|["']$/g, "") });
    }

    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  } catch (err) {
    console.error("[suggest]", err);
    return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
  }
}
