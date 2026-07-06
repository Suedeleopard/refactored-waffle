import type { Metadata } from "next";
import { getSetupStatus } from "@/lib/env";
import { SetupWizard } from "@/components/setup-wizard";

export const metadata: Metadata = { title: "Setup" };

export default function SetupPage() {
  const status = getSetupStatus();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-light tracking-tight">Set up your install</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          A quick guided walkthrough. We&apos;ll connect each piece, explain what it&apos;s
          for in plain language, and check it works before moving on.
        </p>
      </div>
      <SetupWizard initialStatus={status} nodeEnv={process.env.NODE_ENV} />
    </div>
  );
}
