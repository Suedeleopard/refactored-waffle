import Link from "next/link";
import { ArrowRight, Check, Target, Layers, BookOpen, FileText, Lock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LeadForm } from "@/components/lead-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { marketing, plans, sprint } from "@/lib/config";
import { getFeaturedTeardown, getRestOfTeardowns, kindLabel } from "@/lib/teardowns";
import { previewSteps, lockedSteps, worksheetPrompts, outreachTemplates } from "@/lib/kit";

// Copy comes from src/lib/config.ts (marketing.features). Icons are paired by
// position here; edit the words in config, swap icons here if you like.
const featureIcons = [Target, Layers, BookOpen, FileText];
const features = marketing.features.map((f, i) => ({
  ...f,
  icon: featureIcons[i % featureIcons.length],
}));

export default function Home() {
  const kit = plans[0];
  const featured = getFeaturedTeardown();
  const teardowns = getRestOfTeardowns().slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="brand-glow relative">
          <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
            <Badge variant="muted" className="mb-6">
              {marketing.hero.badge}
            </Badge>
            <h1 className="mx-auto max-w-3xl font-display text-5xl font-light leading-[1.05] tracking-tight sm:text-7xl">
              {marketing.hero.headlineTop}
              <br />
              <span className="text-primary">{marketing.hero.headlineAccent}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              {marketing.hero.subhead}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={`/teardowns/${featured.slug}`}>
                  See it work <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#kit">Get The Kit &mdash; {kit.priceLabel}</Link>
              </Button>
            </div>

            <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {marketing.proof.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Proof — the teardowns carry the argument, so they come before the pitch. */}
        <section id="teardowns" className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="font-display text-4xl font-light tracking-tight">
                Read one before you believe it.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Each teardown takes an industry, borrows behaviour from somewhere its customers
                already spend money, and pushes it far enough to see whether it holds. Some
                shipped. Some are waiting for someone to build them.
              </p>
            </div>
            <Link
              href="/teardowns"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              All teardowns <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* The shipped one leads. A real result outsells an invented idea. */}
          <Card className="group mt-12 border-primary/40 transition-colors hover:border-primary/70">
            <CardContent className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge>{kindLabel(featured).label}</Badge>
                  {featured.credit && (
                    <span className="text-xs text-muted-foreground">{featured.credit}</span>
                  )}
                </div>
                <h3 className="mt-5 font-display text-3xl font-light leading-snug tracking-tight">
                  {featured.title}
                </h3>
                <p className="mt-4 text-muted-foreground">{featured.standfirst}</p>
                <Link
                  href={`/teardowns/${featured.slug}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                >
                  Read the whole thing
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              {featured.outcome && (
                <div className="rounded-md border border-primary/30 bg-primary/5 p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    What happened
                  </p>
                  <p className="mt-3 text-sm">{featured.outcome}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {teardowns.map((t) => (
              <Card key={t.slug} className="group transition-colors hover:border-primary/40">
                <CardContent className="flex h-full flex-col p-7">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t.x} &rarr; {t.y}
                  </p>
                  <h3 className="mt-3 font-display text-xl font-light leading-snug tracking-tight">
                    {t.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{t.standfirst}</p>
                  <Link
                    href={`/teardowns/${t.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    Read
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What the method is */}
        <section id="method" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-light tracking-tight">
              Same audience, different behaviour.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Copying your own category makes you invisible. Inventing something alien makes you
              risky. Borrowing behaviour from a category your client&rsquo;s audience already trusts
              is the only move that does both jobs at once.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <Card key={f.title} className="transition-colors hover:border-primary/40">
                <CardContent className="flex gap-4 p-6">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                    <f.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Free — the Swap Sheet. Useful on its own, incomplete in the right way. */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-xl rounded-lg border border-border bg-card p-8 text-center sm:p-10">
            <Badge variant="muted" className="mb-5">
              Free
            </Badge>
            <h2 className="font-display text-3xl font-light tracking-tight">The Swap Sheet</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              One page. Eight questions. Fill it in against any business and you&rsquo;ll have
              something to say that nobody else is saying.
            </p>
            <div className="mx-auto mt-8 max-w-sm">
              <LeadForm
                kind="swap-sheet"
                cta="Send me the Swap Sheet"
                successMessage="On its way. Check your inbox in the next minute or two."
              />
            </div>
          </div>
        </section>

        {/* Look inside — the first steps are readable before paying. Nobody
            buys a method they haven't seen the shape of. */}
        <section id="inside" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="muted" className="mb-5">
              Look inside
            </Badge>
            <h2 className="font-display text-4xl font-light tracking-tight">
              The first two steps, free.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Read them, use them, decide afterwards. The method is {previewSteps.length + lockedSteps.length}{" "}
              steps and the hard part is choosing which industry to borrow from &mdash; which is
              where this preview stops.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-3">
            {previewSteps.map((step) => (
              <Card key={step.n}>
                <CardContent className="p-7">
                  <div className="flex gap-5">
                    <span className="font-display text-2xl font-light text-muted-foreground/50">
                      {String(step.n).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                      <p className="mt-3 border-l-2 border-primary/50 pl-3 text-sm font-medium">
                        {step.prompt}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Locked: titles only. The titles are the itch. */}
            <Card className="border-dashed">
              <CardContent className="p-7">
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Lock className="size-4" />
                  <span>The remaining {lockedSteps.length} steps are in The Kit</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {lockedSteps.map((step) => (
                    <li key={step.n} className="flex items-baseline gap-4 text-sm">
                      <span className="font-display text-base font-light text-muted-foreground/40">
                        {String(step.n).padStart(2, "0")}
                      </span>
                      <span className="text-muted-foreground/70">{step.title}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
                  Plus the {worksheetPrompts.length}-blank worksheet and{" "}
                  {outreachTemplates.length} outreach templates for actually sending it.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The two exits */}
        <section id="kit" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-light tracking-tight">Two ways in</h2>
            <p className="mt-3 text-muted-foreground">
              Learn to run it yourself, or hand me the opportunity you cannot afford to lose.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            <Card className="border-primary/60 ring-1 ring-primary/30">
              <CardContent className="flex h-full flex-col p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{kit.name}</h3>
                  <Badge>Start here</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{kit.description}</p>
                <p className="mt-6 font-display text-4xl">{kit.priceLabel}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {kit.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {feat}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 w-full">
                  <Link href="/signup">Get {kit.name}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex h-full flex-col p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{sprint.name}</h3>
                  <Badge variant="muted">Done for you</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{sprint.summary}</p>
                <p className="mt-6 font-display text-4xl">{sprint.priceLabel}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {sprint.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {d}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-8 w-full">
                  <Link href="/sprint">Enquire</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
