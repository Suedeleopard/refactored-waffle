import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getPlan, hasActiveSubscription } from "@/lib/subscription";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [subscribed, plan] = await Promise.all([hasActiveSubscription(), getPlan()]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.email}</p>
        </div>
        {subscribed && plan && <Badge variant="success">{plan.name} plan</Badge>}
      </div>

      {/* PAYWALL EXAMPLE
          The starter ships with entitlement wired: hasActiveSubscription() gates
          paid features. Replace the unlocked card below with your product, and
          keep (or remove) the gate depending on whether your feature is paid. */}
      {subscribed ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/15 text-primary">
              <Sparkles className="size-6" />
            </div>
            <Badge variant="muted">Product slot</Badge>
            <h2 className="text-lg font-semibold">Your product goes here</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              This user has an active plan, so your paid feature renders. Build it into{" "}
              <code className="font-mono text-foreground">src/app/(app)/dashboard/page.tsx</code>.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Lock className="size-6" />
            </div>
            <h2 className="text-lg font-semibold">Unlock your workspace</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              This is the paywall the starter ships with. Choose a plan to unlock the product —
              once subscribed, the feature above renders automatically.
            </p>
            <Button asChild className="mt-2">
              <Link href="/account">Choose a plan</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
