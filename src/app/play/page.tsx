"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Shuffle, Plus, X, Copy, Check, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { lenses, wildcardIndustries, adjacentIndustries } from "@/lib/remix-banks";

/*
  THE REMIX BOARD — the live session tool.

  Deliberately has no backend, no API calls and no AI. It runs entirely in the
  browser so it cannot fail in front of an audience, and so the thinking stays
  with the room rather than a model. Its only jobs: hold what people shout,
  keep the facilitator on structure, and roll the wildcard.
*/

type Idea = { name: string; body: string };

const SECTION = "mx-auto max-w-4xl px-6";

export default function PlayPage() {
  const [business, setBusiness] = useState("");
  const [audience, setAudience] = useState("");

  const [spend, setSpend] = useState<string[]>([]);
  const [spendDraft, setSpendDraft] = useState("");

  const [industry, setIndustry] = useState("");
  const [rolling, setRolling] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideaName, setIdeaName] = useState("");
  const [ideaBody, setIdeaBody] = useState("");

  const [copied, setCopied] = useState(false);

  /** Spin through the bank before landing. The suspense is the point. */
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

  function addSpend() {
    const v = spendDraft.trim();
    if (!v) return;
    setSpend((s) => [...s, v]);
    setSpendDraft("");
  }

  function addIdea() {
    const n = ideaName.trim();
    if (!n) return;
    setIdeas((i) => [...i, { name: n, body: ideaBody.trim() }]);
    setIdeaName("");
    setIdeaBody("");
  }

  function reset() {
    setBusiness("");
    setAudience("");
    setSpend([]);
    setIndustry("");
    setAnswers({});
    setIdeas([]);
  }

  const summary = useMemo(() => {
    const lines = [
      `${business || "[business]"} behaving like a ${industry || "[industry]"}`,
      "",
      `Audience: ${audience || "—"}`,
      spend.length ? `Already spends on: ${spend.join(", ")}` : "",
      "",
      ...lenses
        .filter((l) => answers[l.key]?.trim())
        .map((l) => `${l.label} — ${answers[l.key].trim()}`),
      "",
      ...(ideas.length ? ["Ideas:"] : []),
      ...ideas.map((i, n) => `${n + 1}. ${i.name}${i.body ? ` — ${i.body}` : ""}`),
    ];
    return lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n").trim();
  }, [business, audience, spend, industry, answers, ideas]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard can be blocked; the summary is on screen to copy by hand. */
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-12 sm:py-16">
        {/* 1 — the setup */}
        <section className={SECTION}>
          <Badge variant="muted" className="mb-5">
            Step 1
          </Badge>
          <h1 className="font-display text-4xl font-light tracking-tight sm:text-5xl">
            Who are we remixing?
          </h1>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="business" className="text-sm font-medium">
                The business
              </label>
              <Input
                id="business"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="An independent plant shop"
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="audience" className="text-sm font-medium">
                Who they want to attract
              </label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Late-twenties renters furnishing a first flat"
                className="h-12 text-lg"
              />
            </div>
          </div>
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
            Shout them out. Not demographics — actual places the money goes.
          </p>

          <div className="mt-6 flex gap-2">
            <Input
              value={spendDraft}
              onChange={(e) => setSpendDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSpend()}
              placeholder="Add one and press enter"
              className="h-12 text-lg"
            />
            <Button onClick={addSpend} size="lg" variant="outline" aria-label="Add">
              <Plus />
            </Button>
          </div>

          {spend.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {spend.map((s, i) => (
                <button
                  key={`${s}-${i}`}
                  onClick={() => setSpend((list) => list.filter((_, n) => n !== i))}
                  className="group inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-destructive/50"
                >
                  {s}
                  <X className="size-3.5 text-muted-foreground group-hover:text-destructive" />
                </button>
              ))}
            </div>
          )}

          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Room gone quiet? Prompts
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {adjacentIndustries.map((a) => (
                <button
                  key={a}
                  onClick={() => setSpend((s) => (s.includes(a) ? s : [...s, a]))}
                  className="rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {a}
                </button>
              ))}
            </div>
          </details>
        </section>

        {/* 3 — the pick */}
        <section className={`${SECTION} mt-16`}>
          <Badge variant="muted" className="mb-5">
            Step 3
          </Badge>
          <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
            Pick the world we&rsquo;re borrowing from
          </h2>

          <div className="mt-8 rounded-lg border border-primary/40 bg-primary/5 p-8 text-center sm:p-12">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              {business || "[business]"} behaving like a
            </p>
            <p
              className={`mt-4 font-display text-4xl font-light tracking-tight sm:text-6xl ${
                rolling ? "opacity-60" : "text-primary"
              }`}
            >
              {industry || "—"}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={rollWildcard} size="lg" disabled={rolling}>
                <Shuffle /> {rolling ? "Rolling…" : "Roll a wildcard"}
              </Button>
              <Input
                value={rolling ? "" : industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="…or type one the room shouted"
                className="h-11 max-w-xs text-center"
              />
            </div>
          </div>
        </section>

        {/* 4 — the rescue */}
        <section className={`${SECTION} mt-16`}>
          <Badge variant="muted" className="mb-5">
            Step 4
          </Badge>
          <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
            What is a {industry || "[industry]"} actually like?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Go free-form first. Only work through these if the room stalls.
          </p>

          <div className="mt-8 space-y-3">
            {lenses.map((lens) => (
              <Card key={lens.key}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                      {lens.label}
                    </span>
                    <span className="font-medium">{lens.question}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{lens.hint}</p>
                  <Input
                    value={answers[lens.key] ?? ""}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [lens.key]: e.target.value }))
                    }
                    placeholder="What the room said"
                    className="mt-4 h-11"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 5 — bring it home */}
        <section className={`${SECTION} mt-16`}>
          <Badge className="mb-5">Step 5</Badge>
          <h2 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
            So what would they do?
          </h2>
          <p className="mt-2 text-lg text-primary">
            {business || "[business]"} behaving like a {industry || "[industry]"}
          </p>
          <p className="mt-3 text-muted-foreground">
            Name each one. The name is what gets remembered and what makes the clip.
          </p>

          <div className="mt-6 space-y-3">
            <Input
              value={ideaName}
              onChange={(e) => setIdeaName(e.target.value)}
              placeholder="Name it — e.g. Plant Growth Membership"
              className="h-12 text-lg"
            />
            <div className="flex gap-2">
              <Input
                value={ideaBody}
                onChange={(e) => setIdeaBody(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addIdea()}
                placeholder="One line on what it is"
                className="h-12"
              />
              <Button onClick={addIdea} size="lg">
                <Plus /> Add
              </Button>
            </div>
          </div>

          {ideas.length > 0 && (
            <div className="mt-8 space-y-3">
              {ideas.map((idea, i) => (
                <Card key={`${idea.name}-${i}`}>
                  <CardContent className="flex items-start gap-5 p-6">
                    <span className="font-display text-2xl font-light text-muted-foreground/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold">{idea.name}</h3>
                      {idea.body && (
                        <p className="mt-1 text-muted-foreground">{idea.body}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setIdeas((l) => l.filter((_, n) => n !== i))}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${idea.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 6 — take it away */}
        <section className={`${SECTION} mt-16`}>
          <div className="rounded-lg border border-border bg-card p-8 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-light tracking-tight">
                The session, on one card
              </h2>
              <div className="flex gap-2">
                <Button onClick={copySummary} variant="outline">
                  {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
                </Button>
                <Button onClick={reset} variant="ghost" aria-label="Start over">
                  <RotateCcw /> New
                </Button>
              </div>
            </div>
            <pre className="mt-6 whitespace-pre-wrap font-sans text-sm text-muted-foreground">
              {summary || "Fill the board in and the summary builds itself."}
            </pre>
            <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
              Want the full method behind this?{" "}
              <Link href="/#kit" className="text-primary underline underline-offset-4">
                The Kit
              </Link>{" "}
              walks all eleven steps, or{" "}
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
