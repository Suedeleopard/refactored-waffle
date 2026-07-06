import Link from "next/link";
import { ArrowRight, Check, Lock, CreditCard, Wand2, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { marketing, plans, siteConfig } from "@/lib/config";

// Copy comes from src/lib/config.ts (marketing.features). Icons are paired by
// position here; edit the words in config, swap icons here if you like.
const featureIcons = [Lock, CreditCard, Wand2, Zap];
const features = marketing.features.map((f, i) => ({ ...f, icon: featureIcons[i % featureIcons.length] }));

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="brand-glow relative">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 text-center">
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
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get started <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/#features">See what&apos;s inside</Link>
              </Button>
            </div>
            <p className="mt-6 font-mono text-xs text-muted-foreground">
              Next.js · Supabase · Stripe · Tailwind
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-4 sm:grid-cols-2">
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

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-light tracking-tight">Pricing</h2>
            <p className="mt-3 text-muted-foreground">
              Wire these to Stripe in the setup wizard. Edit them in one config file.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={plan.featured ? "border-primary/60 ring-1 ring-primary/30" : ""}
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.featured && <Badge>Popular</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  <p className="mt-6 font-display text-4xl">{plan.priceLabel}</p>
                  <ul className="mt-6 space-y-2 text-sm">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check className="size-4 text-primary" /> {feat}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="mt-8 w-full"
                    variant={plan.featured ? "default" : "outline"}
                  >
                    <Link href="/signup">Start with {plan.name}</Link>
                  </Button>
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
