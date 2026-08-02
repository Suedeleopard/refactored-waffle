import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getTeardowns } from "@/lib/teardowns";

export const metadata: Metadata = {
  title: "Teardowns",
  description:
    "Worked examples of X Behaving Like Y. One industry borrowing behaviour from another, taken far enough to see whether it holds.",
};

export default function TeardownsPage() {
  const teardowns = getTeardowns();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <Badge variant="muted" className="mb-6">
              The swipe file
            </Badge>
            <h1 className="font-display text-4xl font-light leading-tight tracking-tight sm:text-5xl">
              Teardowns
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              The method applied in full, one industry at a time. Read a few before you decide
              whether it would work on yours.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {teardowns.map((t) => (
              <Card key={t.slug} className="group transition-colors hover:border-primary/40">
                <CardContent className="flex h-full flex-col p-8">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t.x} &rarr; {t.y}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-light leading-snug tracking-tight">
                    {t.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{t.standfirst}</p>
                  <Link
                    href={`/teardowns/${t.slug}`}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    Read the teardown
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
