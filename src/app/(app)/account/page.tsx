import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { plans } from "@/lib/config";
import { isStripeConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Account" };

type Subscription = {
  status: string | null;
  price_id: string | null;
  current_period_end: string | null;
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, price_id, current_period_end")
    .eq("user_id", user!.id)
    .maybeSingle<Subscription>();

  const stripeReady = isStripeConfigured();
  const activeStatuses = ["active", "trialing"];
  const isActive = subscription && activeStatuses.includes(subscription.status ?? "");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-light tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan and billing.
        </p>
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
              to enable checkout and billing.
            </p>
          </CardContent>
        </Card>
      )}

      {isActive ? (
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge variant="success">Active</Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                Renews{" "}
                {subscription?.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <form action="/api/stripe/portal" method="post">
              <Button type="submit" variant="outline">
                Manage billing
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
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
                    {plan.priceId ? `Choose ${plan.name}` : "Price not set"}
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
