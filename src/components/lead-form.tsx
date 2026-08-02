"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Kind = "swap-sheet" | "sprint";

type Props = {
  kind: Kind;
  /** Label on the submit button. */
  cta: string;
  /** Shown in place of the form once submitted. */
  successMessage: string;
};

/**
 * The capture form for both free entry points. `kind` decides which fields
 * show: the Swap Sheet only needs an email, a Sprint enquiry needs context.
 */
export function LeadForm({ kind, cta, successMessage }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          email: data.get("email"),
          name: data.get("name"),
          company: data.get("company"),
          opportunity: data.get("opportunity"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Try again.");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center justify-center gap-2.5 rounded-md border border-primary/40 bg-primary/5 px-6 py-5 text-sm">
        <Check className="size-4 shrink-0 text-primary" />
        <span>{successMessage}</span>
      </div>
    );
  }

  const isSprint = kind === "sprint";

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      {isSprint && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${kind}-name`}>Your name</Label>
            <Input id={`${kind}-name`} name="name" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${kind}-company`}>Company</Label>
            <Input id={`${kind}-company`} name="company" autoComplete="organization" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${kind}-email`}>Email</Label>
        <Input
          id={`${kind}-email`}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
      </div>

      {isSprint && (
        <div className="space-y-2">
          <Label htmlFor={`${kind}-opportunity`}>What are you pitching for?</Label>
          <textarea
            id={`${kind}-opportunity`}
            name="opportunity"
            rows={4}
            required
            placeholder="Who the client is, what the opportunity is worth, and when you need to be in the room."
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={status === "sending"}>
        {status === "sending" && <Loader2 className="animate-spin" />}
        {cta}
      </Button>
    </form>
  );
}
