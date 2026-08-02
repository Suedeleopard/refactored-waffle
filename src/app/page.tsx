import Link from "next/link";
import { ArrowRight, Check, Target, Layers, BookOpen, FileText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LeadForm } from "@/components/lead-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { marketing, plans, sprint } from "@/lib/config";
import { getTeardowns } from "@/lib/teardowns";

// Copy comes from src/lib/config.ts (marketing.features). Icons are paired by
// position here; edit the words in config, swap icons here if you like.
const featureIcons = [Target, Layers, BookOpen, FileText];
const features = marketing.features.map((f, i) => ({
  ...f,
  icon: featureIcons[i % featureIcons.length],
}));

export default function Home() {
  const kit = plans[0];
  const teardowns = getTeardowns().slice(0, 3);

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
                <Link href="/teardowns">
                  See it work <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#kit">Get The Kit &mdash; {kit.priceLabel}</Link>
              </Button>
            </div>
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
                already spend money, and pushes it far enough to see whether it holds.
              </p>
            </div>
            <Link
              href="/teardowns"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"
            >
              All teardowns <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
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
