import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { plans } from "@/lib/config";
import { isStripeConfigured } from "@/lib/env";
import { getPurchases } from "@/lib/purchases";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const purchases = await getPurchases();
  const ownedIds = new Set(purchases.map((p) => p.plan_id));
  const ownedPlans = plans.filter((p) => ownedIds.has(p.id));
  const unownedPlans = plans.filter((p) => !ownedIds.has(p.id));
  const stripeReady = isStripeConfigured();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage what you own.</p>
      </div>

      {!stripeReady && (
        <Card className="border-primary/40">
          <CardContent className="p-6">
            <Badge variant="muted" className="mb-2">
              Stripe not connected
            </Badge>
            <p className="text-sm text-muted-foreground">
              Connect Stripe in the{" "}
              <a href="/setup" className="text-primary hover:underline">
                setup wizard
              </a>{" "}
              to enable checkout.
            </p>
          </CardContent>
        </Card>
      )}

      {ownedPlans.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <Badge variant="success">Owned</Badge>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              {ownedPlans.map((plan) => {
                const purchase = purchases.find((p) => p.plan_id === plan.id);
                return (
                  <li key={plan.id}>
                    {plan.name}
                    {purchase && ` — purchased ${new Date(purchase.created_at).toLocaleDateString()}`}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {unownedPlans.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {unownedPlans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.featured ? "border-primary/60 ring-1 ring-primary/30" : ""}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {plan.featured && <Badge>Popular</Badge>}
                </div>
                <p className="mt-4 font-display text-3xl">{plan.priceLabel}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="size-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <form action="/api/stripe/checkout" method="post" className="mt-6">
                  <input type="hidden" name="priceId" value={plan.priceId ?? ""} />
                  <Button
                    type="submit"
                    className="w-full"
                    variant={plan.featured ? "default" : "outline"}
                    disabled={!stripeReady || !plan.priceId}
                  >
                    {plan.priceId ? `Get ${plan.name}` : "Price not set"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
