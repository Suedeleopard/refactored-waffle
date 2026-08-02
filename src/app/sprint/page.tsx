import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LeadForm } from "@/components/lead-form";
import { Badge } from "@/components/ui/badge";
import { sprint } from "@/lib/config";

export const metadata: Metadata = {
  title: sprint.name,
  description: sprint.summary,
};

export default function SprintPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <Badge variant="muted" className="mb-6">
            Done for you
          </Badge>
          <h1 className="font-display text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl">
            {sprint.name}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">{sprint.summary}</p>

          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
                What you get
              </h2>
              <ul className="mt-5 space-y-3 text-sm">
                {sprint.deliverables.map((d) => (
                  <li key={d} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
                How it works
              </h2>
              <ol className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li>
                  <span className="text-foreground">One call.</span> The opportunity, the client,
                  who else is in the process.
                </li>
                <li>
                  <span className="text-foreground">Two weeks.</span> The method run properly
                  against your live brief.
                </li>
                <li>
                  <span className="text-foreground">One handover.</span> The angle, the spine, and
                  the section of the deck that carries it.
                </li>
              </ol>
              <p className="mt-6 font-display text-3xl font-light">{sprint.priceLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Fixed scope, agreed before we start.
              </p>
            </div>
          </div>

          <div className="mt-16 rounded-lg border border-border bg-card p-8 sm:p-10">
            <h2 className="font-display text-2xl font-light tracking-tight">
              Tell me what you&rsquo;re pitching for.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              If it isn&rsquo;t a fit I&rsquo;ll say so, and point you at the part of the method
              that would help anyway.
            </p>
            <div className="mt-8">
              <LeadForm
                kind="sprint"
                cta="Start the conversation"
                successMessage="Thank you. I read every one of these and I'll come back to you within two working days."
              />
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Not ready for this?{" "}
            <Link href="/#kit" className="text-primary underline underline-offset-4">
              The Kit
            </Link>{" "}
            teaches you to run it yourself, or{" "}
            <Link href="/teardowns" className="text-primary underline underline-offset-4">
              read a teardown
            </Link>{" "}
            first.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
