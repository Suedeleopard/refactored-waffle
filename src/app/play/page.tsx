"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Shuffle, Plus, X, Copy, Check, RotateCcw, Star, ArrowRight, Sparkles, Wand2, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  lenses,
  wildcardIndustries,
  adjacentIndustries,
  profileFields,
} from "@/lib/remix-banks";
import { ritualsFor } from "@/lib/ritual-library";

/*
  THE REMIX BOARD — the facilitator's shared screen.

  Runs entirely in the browser: no API calls, nothing to fail in front of a
  room. Picking an industry pulls its peak behaviours from a seeded library so
  the board starts full rather than empty — a blank box is the enemy, because
  people cannot recall on demand but they can happily correct a wrong answer.

  The important bit is step 4. Seeing "what a run club does" next to "what a
  plant shop could do" is where the ideas come from — a list of answers with
  the translation hidden somewhere else produces nothing.
*/

type Row = { id: number; does: string; could: string; keep: boolean };

const SECTION = "mx-auto max-w-5xl px-6";

export default function PlayPage() {
  const [business, setBusiness] = useState("");
  const [profile, setProfile] = useState<Record<string, string>>({});

  const [spend, setSpend] = useState<string[]>([]);
  const [spendDraft, setSpendDraft] = useState("");

  const [industry, setIndustry] = useState("");
  const [rolling, setRolling] = useState(false);

  const [rows, setRows] = useState<Row[]>([]);
  const [doesDraft, setDoesDraft] = useState("");
  const [activeLens, setActiveLens] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  /* Suggestions are optional. If the endpoint isn't configured, or fails, we
     hide the buttons and the session carries on from the seeded library —
     nobody watching needs to know anything was meant to happen. */
  const [aiOff, setAiOff] = useState(false);
  const [mode, setMode] = useState<"question" | "idea">("question");
  const [busy, setBusy] = useState<string | null>(null);

  async function suggest(payload: Record<string, unknown>) {
    const res = await fetch("/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 503) {
      setAiOff(true);
      throw new Error("not configured");
    }
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  }

  async function suggestAvatar() {
    if (!business.trim() || busy) return;
    setBusy("avatar");
    try {
      const { fields } = await suggest({ kind: "avatar", business });
      setProfile((p) => ({ ...p, ...fields }));
    } catch {
      /* Silent by design — see note above. */
    } finally {
      setBusy(null);
    }
  }

  async function sparkRow(row: Row) {
    if (busy) return;
    setBusy(String(row.id));
    try {
      const { text } = await suggest({
        kind: "spark",
        mode,
        business,
        industry,
        behaviour: row.does,
      });
      patchRow(row.id, { could: text });
    } catch {
      /* Silent by design. */
    } finally {
      setBusy(null);
    }
  }

  const xName = business.trim() || "the business";
  const yName = industry.trim() || "them";

  function addSpend(value?: string) {
    const v = (value ?? spendDraft).trim();
    if (!v || spend.includes(v)) return;
    setSpend((s) => [...s, v]);
    if (!value) setSpendDraft("");
  }

  /** Secondary to picking from the spend list — a stretch, not the main move. */
  function rollWildcard() {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    const timer = setInterval(() => {
      setIndustry(wildcardIndustries[Math.floor(Math.random() * wildcardIndustries.length)]);
      ticks += 1;
      if (ticks > 14) {
        clearInterval(timer);
        setRolling(false);
      }
    }, 90);
  }

  function addRow(value?: string) {
    const v = (value ?? doesDraft).trim();
    if (!v || rows.some((r) => r.does.toLowerCase() === v.toLowerCase())) return;
    setRows((r) => [...r, { id: Date.now() + Math.random(), does: v, could: "", keep: false }]);
    if (!value) setDoesDraft("");
  }

  /** Everything the library knows about this industry that isn't on the board yet. */
  const suggestions = useMemo(() => {
    const onBoard = new Set(rows.map((r) => r.does.toLowerCase()));
    return ritualsFor(industry).filter((s) => !onBoard.has(s.toLowerCase()));
  }, [industry, rows]);

  function addAllSuggestions() {
    const stamp = Date.now();
    setRows((r) => [
      ...r,
      ...suggestions.map((s, i) => ({ id: stamp + i, does: s, could: "", keep: false })),
    ]);
  }

  function patchRow(id: number, patch: Partial<Row>) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function reset() {
    setBusiness("");
    setProfile({});
    setSpend([]);
    setIndustry("");
    setRows([]);
    setActiveLens(null);
  }

  const kept = rows.filter((r) => r.keep && r.could.trim());

  const summary = useMemo(() => {
    const profileLines = profileFields
      .filter((f) => profile[f.key]?.trim())
      .map((f) => `  ${f.label}: ${profile[f.key].trim()}`);
    const out = [
      `${xName} behaving like ${yName}`,
      "",
      ...(profileLines.length ? ["Who we're trying to reach:", ...profileLines, ""] : []),
      ...(spend.length ? [`They already spend on: ${spend.join(", ")}`, ""] : []),
      ...(kept.length ? ["The keepers:"] : []),
      ...kept.map((r, i) => `${i + 1}. ${r.does}  →  ${r.could}`),
    ];
    return out.join("\n").trim();
  }, [xName, yName, profile, spend, kept]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard can be blocked; the summary is on screen to copy by hand. */
    }
  }

  const lensHint = lenses.find((l) => l.key === activeLens);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        {/* 1 — who are we reaching */}
        <section className={SECTION}>
          <Badge variant="muted" className="mb-5">
            Step 1
          </Badge>
          <h1 className="font-display text-4xl font-light tracking-tight sm:text-5xl">
            Who are we remixing, and for whom?
          </h1>

          <div className="mt-8 space-y-2">
            <label htmlFor="business" className="text-sm font-medium">
              The business
            </label>
            <Input
              id="business"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="An independent plant shop"
              className="h-14 text-xl"
            />
          </div>

          <Card className="mt-6">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-light tracking-tight">
                    The person they want to attract
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill this in together. Nobody suggests an industry until the room can
                    picture the same human being.
                  </p>
                </div>
                {!aiOff && (
                  <Button
                    onClick={suggestAvatar}
                    variant="outline"
                    size="sm"
                    disabled={!business.trim() || busy === "avatar"}
                  >
                    {busy === "avatar" ? <Loader2 className="animate-spin" /> : <Wand2 />}
                    Suggest
                  </Button>
                )}
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {profileFields.map((f) => (
                  <div key={f.key} className="space-y-2">
                    <label htmlFor={f.key} className="text-sm font-medium">
                      {f.label}
                    </label>
                    <Input
                      id={f.key}
                      value={profile[f.key] ?? ""}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, [f.key]: e.target.value }))
                      }
                      placeholder={f.placeholder}
                      className="h-11"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2 — where the money already goes */}
        <section className={`${SECTION} mt-16`}>
          <Badge variant="muted" className="mb-5">
            Step 2
          </Badge>
          <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
            Where does that person already spend?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Shout them out. These are the worlds we&rsquo;re allowed to borrow from &mdash;
            that&rsquo;s what makes a bold idea feel safe.
          </p>

          <div className="mt-6 flex gap-2">
            <Input
              value={spendDraft}
              onChange={(e) => setSpendDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSpend()}
              placeholder="Type one and press enter"
              className="h-12 text-lg"
            />
            <Button onClick={() => addSpend()} size="lg" variant="outline" aria-label="Add">
              <Plus />
            </Button>
          </div>

          {spend.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {spend.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  {s}
                  <button
                    onClick={() => setSpend((l) => l.filter((x) => x !== s))}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Remove ${s}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="mt-8 text-sm text-muted-foreground">Room gone quiet? Tap to add:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {adjacentIndustries
              .filter((a) => !spend.includes(a))
              .map((a) => (
                <button
                  key={a}
                  onClick={() => addSpend(a)}
                  className="rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  + {a}
                </button>
              ))}
          </div>
        </section>

        {/* 3 — pick from the list you just built */}
        <section className={`${SECTION} mt-16`}>
          <Badge variant="muted" className="mb-5">
            Step 3
          </Badge>
          <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
            Pick one of those worlds
          </h2>
          <p className="mt-3 text-muted-foreground">
            It has to come from the list above. That&rsquo;s the whole argument &mdash; the
            audience already trusts it.
          </p>

          {spend.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {spend.map((s) => (
                <button
                  key={s}
                  onClick={() => setIndustry(s)}
                  className={`rounded-md border px-4 py-2.5 text-base transition-colors ${
                    industry === s
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border hover:border-primary/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Add a few in step 2 first and they&rsquo;ll appear here.
            </p>
          )}

          <div className="mt-8 rounded-lg border border-primary/40 bg-primary/5 p-8 text-center sm:p-10">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              {xName} behaving like
            </p>
            <p
              className={`mt-3 font-display text-4xl font-light tracking-tight sm:text-6xl ${
                rolling ? "opacity-60" : "text-primary"
              }`}
            >
              {industry || "—"}
            </p>
          </div>

          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Feeling brave? Roll a wildcard instead
            </summary>
            <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button onClick={rollWildcard} variant="outline" disabled={rolling}>
                <Shuffle /> {rolling ? "Rolling…" : "Roll a wildcard"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Breaks the audience logic on purpose. Great for the last round, risky for
                the first.
              </p>
            </div>
          </details>
        </section>

        {/* 4 — THE BOARD */}
        <section className={`${SECTION} mt-16`}>
          <Badge className="mb-5">Step 4</Badge>
          <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
            The board
          </h2>
          <p className="mt-3 text-muted-foreground">
            Fill the left column fast &mdash; everything {yName} actually does. Then go back
            along each row and ask what the equivalent is for {xName}.
          </p>

          <div className="mt-6 flex gap-2">
            <Input
              value={doesDraft}
              onChange={(e) => setDoesDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRow()}
              placeholder={`What does ${yName} do? Press enter`}
              className="h-12 text-lg"
            />
            <Button onClick={() => addRow()} size="lg">
              <Plus /> Add
            </Button>
          </div>

          {/* The head start. Tap what's right, ignore what isn't. */}
          {suggestions.length > 0 && (
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-primary" />
                  What {yName} is known for
                </p>
                <Button onClick={addAllSuggestions} size="sm" variant="outline">
                  Add all {suggestions.length}
                </Button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap the ones that ring true. Wrong ones are useful too &mdash; the room
                correcting them is half the session.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => addRow(s)}
                    className="rounded-md border border-dashed border-border bg-background px-3 py-2 text-sm text-left transition-colors hover:border-primary/60"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {lenses.map((l) => (
              <button
                key={l.key}
                onClick={() => setActiveLens(activeLens === l.key ? null : l.key)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  activeLens === l.key
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-dashed border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {lensHint && (
            <p className="mt-3 text-sm">
              <span className="font-medium">{lensHint.question}</span>{" "}
              <span className="text-muted-foreground">{lensHint.hint}</span>
            </p>
          )}

          {!aiOff && rows.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <span className="text-sm font-medium">The spark button gives you:</span>
              <div className="flex overflow-hidden rounded-md border border-border">
                <button
                  onClick={() => setMode("question")}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    mode === "question" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  A question
                </button>
                <button
                  onClick={() => setMode("idea")}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    mode === "idea" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  An idea
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                {mode === "question"
                  ? "The room answers it. You stay in charge."
                  : "It answers for you. Faster, but the room goes quiet."}
              </span>
            </div>
          )}

          {rows.length > 0 && (
            <div className="mt-8 overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 border-b border-border bg-card px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground sm:px-6">
                <span>What {yName} does</span>
                <span className="w-5" />
                <span>So {xName} could&hellip;</span>
              </div>
              {rows.map((row) => (
                <div
                  key={row.id}
                  className={`grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border px-4 py-3 last:border-0 sm:px-6 ${
                    row.keep ? "bg-primary/5" : ""
                  }`}
                >
                  <Input
                    value={row.does}
                    onChange={(e) => patchRow(row.id, { does: e.target.value })}
                    className="h-11 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
                  />
                  <ArrowRight className="size-5 shrink-0 text-muted-foreground/60" />
                  <div className="flex items-center gap-2">
                    <Input
                      value={row.could}
                      onChange={(e) => patchRow(row.id, { could: e.target.value })}
                      placeholder="…?"
                      className="h-11 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
                    />
                    {!aiOff && (
                      <button
                        onClick={() => sparkRow(row)}
                        disabled={busy !== null}
                        className="shrink-0 text-muted-foreground/40 transition-colors hover:text-primary disabled:opacity-40"
                        aria-label="Spark this row"
                      >
                        {busy === String(row.id) ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Wand2 className="size-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => patchRow(row.id, { keep: !row.keep })}
                      className={`shrink-0 transition-colors ${
                        row.keep ? "text-primary" : "text-muted-foreground/40 hover:text-primary"
                      }`}
                      aria-label={row.keep ? "Unkeep" : "Keep"}
                    >
                      <Star className={`size-4 ${row.keep ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))}
                      className="shrink-0 text-muted-foreground/40 transition-colors hover:text-destructive"
                      aria-label="Remove row"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {rows.length > 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              Star the rows worth keeping. {kept.length} starred so far.
            </p>
          )}
        </section>

        {/* 5 — take it away */}
        <section className={`${SECTION} mt-16`}>
          <div className="rounded-lg border border-border bg-card p-8 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-light tracking-tight">
                  Send it to them
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Copy this into the chat so whoever volunteered leaves with it.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={copySummary} variant="outline">
                  {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
                </Button>
                <Button onClick={reset} variant="ghost">
                  <RotateCcw /> Next business
                </Button>
              </div>
            </div>
            <pre className="mt-6 whitespace-pre-wrap font-sans text-sm text-muted-foreground">
              {summary || "Fill the board in and this writes itself."}
            </pre>
            <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
              The full method behind this is in{" "}
              <Link href="/#kit" className="text-primary underline underline-offset-4">
                The Kit
              </Link>
              , or{" "}
              <Link href="/teardowns" className="text-primary underline underline-offset-4">
                read a teardown
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
