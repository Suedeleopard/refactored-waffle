import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getOwnedPlan, hasPurchased } from "@/lib/purchases";
import { methodSteps, worksheetPrompts, outreachTemplates } from "@/lib/kit";
import { getTeardowns } from "@/lib/teardowns";
import { plans, sprint } from "@/lib/config";

export const metadata: Metadata = { title: "The Kit" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [owns, plan] = await Promise.all([hasPurchased(), getOwnedPlan()]);
  const kit = plans[0];

  if (!owns) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-light tracking-tight">The Kit</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.email}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Lock className="size-6" />
            </div>
            <h2 className="text-lg font-semibold">You don&rsquo;t own The Kit yet</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              The eleven-step method, the worksheet and the outreach templates. One payment,
              yours permanently.
            </p>
            <Button asChild className="mt-2">
              <Link href="/account">Get The Kit &mdash; {kit.priceLabel}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light tracking-tight">The Kit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you need to run the method against one live opportunity.
          </p>
        </div>
        {plan && <Badge variant="success">{plan.name}</Badge>}
      </div>

      {/* The method */}
      <section>
        <h2 className="font-display text-2xl font-light tracking-tight">The method</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Eleven steps. Work them in order the first time. After that you&rsquo;ll skip around.
        </p>
        <div className="mt-6 space-y-3">
          {methodSteps.map((step) => (
            <Card key={step.n}>
              <CardContent className="p-6">
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
        </div>
      </section>

      {/* The worksheet */}
      <section>
        <h2 className="font-display text-2xl font-light tracking-tight">The worksheet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Once you have a pairing, fill this in. Eight blanks, one sitting. Print it or copy it
          into a doc.
        </p>
        <Card className="mt-6">
          <CardContent className="p-8">
            <p className="font-display text-xl font-light">
              If a{" "}
              <span className="border-b border-dashed border-muted-foreground/60 px-6">
                &nbsp;
              </span>{" "}
              behaved like a{" "}
              <span className="border-b border-dashed border-muted-foreground/60 px-6">
                &nbsp;
              </span>
              , they&rsquo;d probably&hellip;
            </p>
            <ul className="mt-8 space-y-5">
              {worksheetPrompts.map((prompt) => (
                <li key={prompt} className="flex flex-wrap items-baseline gap-2 text-sm">
                  <span className="w-44 shrink-0 font-medium">{prompt}</span>
                  <span className="h-5 min-w-32 flex-1 border-b border-dashed border-muted-foreground/40" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Outreach */}
      <section>
        <h2 className="font-display text-2xl font-light tracking-tight">The outreach templates</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The idea is only worth having if it gets sent. Keep these short. Resist the urge to
          explain.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {outreachTemplates.map((t) => (
            <Card key={t.name}>
              <CardContent className="flex h-full flex-col p-6">
                <h3 className="font-semibold">{t.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t.when}</p>
                <pre className="mt-4 flex-1 whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                  {t.body}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Swipe file + upsell */}
      <section>
        <h2 className="font-display text-2xl font-light tracking-tight">The swipe file</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {getTeardowns().length} worked teardowns, with more added as they&rsquo;re published.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Card className="transition-colors hover:border-primary/40">
            <CardContent className="flex h-full flex-col p-6">
              <h3 className="font-semibold">Read the teardowns</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Every one is the method run end to end. The fastest way to calibrate what a good
                pairing feels like.
              </p>
              <Link
                href="/teardowns"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                Open the swipe file <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
          <Card className="transition-colors hover:border-primary/40">
            <CardContent className="flex h-full flex-col p-6">
              <h3 className="font-semibold">{sprint.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Got something big in the diary and not enough time? I&rsquo;ll run the method
                against it with you.
              </p>
              <Link
                href="/sprint"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                {sprint.priceLabel} <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
