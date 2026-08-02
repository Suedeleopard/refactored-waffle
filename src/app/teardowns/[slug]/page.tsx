import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTeardown, getTeardowns, kindLabel } from "@/lib/teardowns";
import { plans } from "@/lib/config";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getTeardowns().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const teardown = getTeardown(slug);
  if (!teardown) return { title: "Teardown not found" };
  return { title: teardown.title, description: teardown.standfirst };
}

export default async function TeardownPage({ params }: Props) {
  const { slug } = await params;
  const teardown = getTeardown(slug);
  if (!teardown) notFound();

  const kit = plans[0];
  const kind = kindLabel(teardown);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
          <Link
            href="/teardowns"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All teardowns
          </Link>

          <header className="mt-10">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={teardown.kind === "made" ? "default" : "muted"}>{kind.label}</Badge>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {teardown.x} &rarr; {teardown.y}
              </p>
            </div>
            <h1 className="mt-5 font-display text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl">
              {teardown.title}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">{teardown.standfirst}</p>
            <p className="mt-6 border-l-2 border-border pl-4 text-sm text-muted-foreground">
              {kind.note}
            </p>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
              {teardown.published}
            </p>
          </header>

          <section className="mt-14 space-y-8">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
                The shared audience
              </h2>
              <p className="mt-3 text-muted-foreground">{teardown.sharedAudience}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
                Why this pairing
              </h2>
              <p className="mt-3 text-muted-foreground">{teardown.rationale}</p>
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-light tracking-tight">
              {teardown.kind === "made" ? "What would naturally exist" : "What they actually do"}
            </h2>
            <div className="mt-8 space-y-4">
              {teardown.ideas.map((idea, i) => (
                <Card key={idea.name}>
                  <CardContent className="p-8">
                    <div className="flex items-baseline gap-4">
                      <span className="font-display text-2xl font-light text-muted-foreground/50">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold">{idea.name}</h3>
                        <p className="mt-2 text-muted-foreground">{idea.body}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {teardown.outcome && (
            <section className="mt-16 rounded-lg border border-primary/40 bg-primary/5 p-8 sm:p-10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
                What happened
              </h2>
              <p className="mt-4 text-lg">{teardown.outcome}</p>
            </section>
          )}

          <aside className="mt-20 rounded-lg border border-border bg-card p-10 text-center">
            <Badge variant="muted" className="mb-5">
              Your turn
            </Badge>
            <h2 className="font-display text-3xl font-light tracking-tight">
              Now run it on the thing you have to win.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              The Kit is the method behind every teardown here, plus the worksheet that gets you
              from a blank page to a pairing worth pitching.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get The Kit &mdash; {kit.priceLabel} <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sprint">Have it done for you</Link>
              </Button>
            </div>
          </aside>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
