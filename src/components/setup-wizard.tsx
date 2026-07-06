"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  XCircle,
} from "lucide-react";
import type { IntegrationStatus } from "@/lib/env";
import { SETUP_STEPS, MIGRATION_SQL, type SetupStepDef } from "@/lib/setup-steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type ValidState = "idle" | "testing" | "valid" | "error";
const STORAGE_KEY = "tsc-setup-wizard-v1";

export function SetupWizard({
  initialStatus,
  nodeEnv,
}: {
  initialStatus: IntegrationStatus[];
  nodeEnv: string | undefined;
}) {
  const router = useRouter();
  const isProd = nodeEnv === "production";

  // Which integrations are already connected (from env on first server render).
  const initiallyDone = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const s of initialStatus) map[s.key] = s.configured;
    return map;
  }, [initialStatus]);

  const TOTAL = SETUP_STEPS.length + 2; // welcome + integrations + done
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [valid, setValid] = useState<Record<string, ValidState>>(initiallyDone ? mapState(initiallyDone) : {});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [creatingPlans, setCreatingPlans] = useState(false);
  const [plansResult, setPlansResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [schemaReady, setSchemaReady] = useState(false);
  const [checkingSchema, setCheckingSchema] = useState(false);
  const [schemaResult, setSchemaResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Restore step + non-secret values after a manual refresh. This runs once on
  // mount (not during render) so it can't cause a hydration mismatch — the
  // setState-in-effect is intentional here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { stepIndex?: number; values?: Record<string, string> };
      if (saved.values) setValues((v) => ({ ...saved.values, ...v }));
      if (typeof saved.stepIndex === "number") setStepIndex(saved.stepIndex);
    } catch {
      /* ignore */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const nonSecret: Record<string, string> = {};
    for (const step of SETUP_STEPS) {
      for (const f of step.fields) {
        if (!f.secret && values[f.name]) nonSecret[f.name] = values[f.name];
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stepIndex, values: nonSecret }));
    } catch {
      /* ignore */
    }
  }, [stepIndex, values]);

  function setField(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800);
    } catch {
      /* ignore */
    }
  }

  async function testConnection(step: SetupStepDef) {
    setValid((s) => ({ ...s, [step.key]: "testing" }));
    setMessages((m) => ({ ...m, [step.key]: "" }));

    const payload: Record<string, string> = {};
    for (const f of step.fields) {
      if (values[f.name]?.trim()) payload[f.name] = values[f.name].trim();
    }

    const res = await fetch("/api/setup/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ integration: step.key, values: payload }),
    });
    const data = (await res.json()) as { ok: boolean; message: string };

    setValid((s) => ({ ...s, [step.key]: data.ok ? "valid" : "error" }));
    setMessages((m) => ({ ...m, [step.key]: data.message }));
  }

  // Create the plans defined in config.ts directly in Stripe, then fill in the
  // returned Price IDs so the installer never touches the dashboard for this.
  async function createStripePlans() {
    const secretKey = values.STRIPE_SECRET_KEY?.trim();
    if (!secretKey) {
      setPlansResult({ ok: false, message: "Add your Stripe secret key above first." });
      return;
    }
    setCreatingPlans(true);
    setPlansResult(null);

    const res = await fetch("/api/setup/stripe/create-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secretKey }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      message?: string;
      created?: { name: string; reused: boolean }[];
      values?: Record<string, string>;
    };
    setCreatingPlans(false);

    if (!data.ok || !data.values) {
      setPlansResult({ ok: false, message: data.message ?? "Couldn't create the plans." });
      return;
    }

    setValues((v) => ({ ...v, ...data.values }));
    const names = (data.created ?? []).map((c) => c.name).join(" and ");
    const reused = (data.created ?? []).some((c) => c.reused);
    setPlansResult({
      ok: true,
      message: `${reused ? "Found" : "Created"} ${names} in Stripe and filled in the Price IDs below.`,
    });
  }

  // Verify the database tables exist before letting Supabase count as done.
  async function checkSchema() {
    setCheckingSchema(true);
    setSchemaResult(null);
    const res = await fetch("/api/setup/supabase/check-schema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: values.NEXT_PUBLIC_SUPABASE_URL?.trim(),
        key: values.SUPABASE_SERVICE_ROLE_KEY?.trim() || values.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
      }),
    });
    const data = (await res.json()) as { ok: boolean; ready?: boolean; message: string };
    setCheckingSchema(false);
    setSchemaReady(Boolean(data.ready));
    setSchemaResult({ ok: Boolean(data.ready), message: data.message });
  }

  async function finish() {
    setFinishing(true);
    setFinishError(null);

    const payload: Record<string, string> = { NEXT_PUBLIC_SITE_URL: location.origin };
    for (const step of SETUP_STEPS) {
      if (skipped[step.key]) continue;
      for (const f of step.fields) {
        if (values[f.name]?.trim()) payload[f.name] = values[f.name].trim();
      }
    }

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: payload }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFinishing(false);
      setFinishError(data.message ?? "Could not save. Check the terminal running the dev server.");
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }

    // Writing .env.local restarts the dev server; poll until it picks up the
    // new env, then move into the app.
    await waitForConfigured();
    router.push("/dashboard");
    router.refresh();
  }

  const progress = Math.round((stepIndex / (TOTAL - 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
          <span>
            Step {stepIndex + 1} of {TOTAL}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isProd && (
        <p className="rounded-md border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          This is your live site, so keys can&apos;t be saved here automatically. Use this
          walkthrough to gather and check your details, then add them in your hosting
          settings and publish again.
        </p>
      )}

      {/* Welcome */}
      {stepIndex === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-light">Let&apos;s get you set up</h2>
            <p className="mt-2 text-muted-foreground">
              Your app uses a few outside tools to handle accounts, payments, and email.
              We&apos;ll connect each one, explain what it&apos;s for, and check it works before
              moving on. The optional ones can wait.
            </p>
          </div>
          <ul className="space-y-2">
            {SETUP_STEPS.map((s) => (
              <li
                key={s.key}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <span className="font-medium">{s.label}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{s.tagline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{s.estimate}</span>
                  <Badge variant={s.required ? "default" : "muted"}>
                    {s.required ? "Required" : "Optional"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium">Before you start</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;ll create a free account at each service as you go. Handy to open now:{" "}
              <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-secondary hover:underline">Supabase</a>,{" "}
              <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" className="text-secondary hover:underline">Stripe</a>
              {" "}(optional), and{" "}
              <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-secondary hover:underline">Vercel</a>
              {" "}for when you deploy.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStepIndex(1)}>
              Start setup <ArrowRight />
            </Button>
          </div>
        </div>
      )}

      {/* Integration steps */}
      {stepIndex >= 1 && stepIndex <= SETUP_STEPS.length && (
        <IntegrationStep
          step={SETUP_STEPS[stepIndex - 1]}
          values={values}
          setField={setField}
          state={valid[SETUP_STEPS[stepIndex - 1].key] ?? "idle"}
          message={messages[SETUP_STEPS[stepIndex - 1].key]}
          alreadyConnected={initiallyDone[SETUP_STEPS[stepIndex - 1].key]}
          copied={copied}
          onCopy={copy}
          onTest={() => testConnection(SETUP_STEPS[stepIndex - 1])}
          onBack={() => setStepIndex((i) => i - 1)}
          onSkip={() => {
            setSkipped((s) => ({ ...s, [SETUP_STEPS[stepIndex - 1].key]: true }));
            setStepIndex((i) => i + 1);
          }}
          onNext={() => setStepIndex((i) => i + 1)}
          onCreatePlans={createStripePlans}
          creatingPlans={creatingPlans}
          plansResult={plansResult}
          onCheckSchema={checkSchema}
          checkingSchema={checkingSchema}
          schemaReady={schemaReady}
          schemaResult={schemaResult}
        />
      )}

      {/* Done */}
      {stepIndex === TOTAL - 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-light">Ready to go</h2>
            <p className="mt-2 text-muted-foreground">
              Here&apos;s what&apos;s connected. When you finish, we&apos;ll save everything and
              open your app.
            </p>
          </div>
          <ul className="space-y-2">
            {SETUP_STEPS.map((s) => {
              const connected = valid[s.key] === "valid" || initiallyDone[s.key];
              return (
                <li
                  key={s.key}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <span className="font-medium">{s.label}</span>
                  {connected ? (
                    <span className="flex items-center gap-1.5 text-sm text-primary">
                      <CheckCircle2 className="size-4" /> Connected
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Skipped</span>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Deploy helper: the same keys, ready to paste into a host like Vercel */}
          {(() => {
            const block = buildEnvBlock(values);
            if (!block) return null;
            return (
              <div className="space-y-2 rounded-lg border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wide text-secondary">Deploying?</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Paste these into your host&apos;s environment variables (e.g. Vercel) when you go live.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(block, "env")}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-xs hover:bg-accent"
                  >
                    {copied === "env" ? (
                      <>
                        <ClipboardCheck className="size-3 text-primary" /> Copied
                      </>
                    ) : (
                      <>
                        <Clipboard className="size-3" /> Copy env
                      </>
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-md bg-background p-3 font-mono text-xs text-muted-foreground">
                  {maskEnvBlock(block)}
                </pre>
              </div>
            );
          })()}

          {finishError && <p className="text-sm text-destructive">{finishError}</p>}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStepIndex((i) => i - 1)} disabled={finishing}>
              <ArrowLeft /> Back
            </Button>
            <Button onClick={finish} disabled={finishing || isProd}>
              {finishing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving &amp; starting…
                </>
              ) : (
                <>Finish setup <ArrowRight /></>
              )}
            </Button>
          </div>
          {isProd && (
            <p className="text-sm text-muted-foreground">
              On your live site, add your checked details in your hosting settings instead.
            </p>
          )}
        </div>
      )}

      {/* Migration SQL lives here as a hidden source for the copy button */}
      <span className="hidden" data-migration-sql>
        {MIGRATION_SQL}
      </span>
    </div>
  );
}

function IntegrationStep({
  step,
  values,
  setField,
  state,
  message,
  alreadyConnected,
  copied,
  onCopy,
  onTest,
  onBack,
  onSkip,
  onNext,
  onCreatePlans,
  creatingPlans,
  plansResult,
  onCheckSchema,
  checkingSchema,
  schemaReady,
  schemaResult,
}: {
  step: SetupStepDef;
  values: Record<string, string>;
  setField: (name: string, value: string) => void;
  state: ValidState;
  message?: string;
  alreadyConnected?: boolean;
  copied: string | null;
  onCopy: (text: string, id: string) => void;
  onTest: () => void;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  onCreatePlans?: () => void;
  creatingPlans?: boolean;
  plansResult?: { ok: boolean; message: string } | null;
  onCheckSchema?: () => void;
  checkingSchema?: boolean;
  schemaReady?: boolean;
  schemaResult?: { ok: boolean; message: string } | null;
}) {
  const connected = state === "valid" || alreadyConnected;
  // Supabase also requires its tables to exist before advancing — this is what
  // turns the old silent failure (signup breaks later) into a clear gate.
  const needsSchema = step.key === "supabase" && !alreadyConnected;
  const canAdvance = connected && (!needsSchema || Boolean(schemaReady));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-light">{step.label}</h2>
          <Badge variant={step.required ? "default" : "muted"}>
            {step.required ? "Required" : "Optional"}
          </Badge>
          {connected && (
            <span className="flex items-center gap-1.5 text-sm text-primary">
              <CheckCircle2 className="size-4" /> Connected
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{step.tagline}</p>
      </div>

      {/* What / Why / Skip */}
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <Explainer label="What it does" body={step.what} />
        <Explainer label="Why you need it" body={step.why} />
        {step.skip && <Explainer label="If you skip" body={step.skip} muted />}
      </div>

      {/* Walkthrough */}
      <ol className="space-y-4">
        {step.walkthrough.map((w, i) => (
          <li key={w.title} className="flex gap-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border font-mono text-xs text-muted-foreground">
              {i + 1}
            </span>
            <div className="space-y-2">
              <h4 className="font-medium">{w.title}</h4>
              <p className="text-sm text-muted-foreground">{w.body}</p>
              <div className="flex flex-wrap items-center gap-2">
                {w.link && (
                  <a
                    href={w.link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-secondary hover:underline"
                  >
                    {w.link.label} <ExternalLink className="size-3" />
                  </a>
                )}
                {w.copySql && (
                  <button
                    type="button"
                    onClick={() => onCopy(MIGRATION_SQL, "sql")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-xs hover:bg-accent"
                  >
                    {copied === "sql" ? (
                      <>
                        <ClipboardCheck className="size-3 text-primary" /> Copied
                      </>
                    ) : (
                      <>
                        <Clipboard className="size-3" /> Copy the setup code
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Fields + test */}
      {!alreadyConnected && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          {step.fields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name} className="flex items-center gap-2">
                {f.label}
                {!f.required && <span className="font-mono text-xs text-muted-foreground">optional</span>}
              </Label>
              {f.assemble ? (
                <>
                  <div className="flex items-stretch overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
                    <span className="flex items-center bg-muted px-3 font-mono text-sm text-muted-foreground">
                      {f.assemble.prefix}
                    </span>
                    <input
                      id={f.name}
                      type="text"
                      placeholder={f.placeholder}
                      value={middleOf(values[f.name], f.assemble)}
                      onChange={(e) => setField(f.name, assemble(e.target.value, f.assemble!))}
                      autoComplete="off"
                      className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <span className="flex items-center bg-muted px-3 font-mono text-sm text-muted-foreground">
                      {f.assemble.suffix}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{f.assemble.hint}</p>
                </>
              ) : (
                <Input
                  id={f.name}
                  type={f.secret ? "password" : "text"}
                  placeholder={f.placeholder}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  autoComplete="off"
                />
              )}
            </div>
          ))}

          <div className="flex items-center gap-3">
            <Button onClick={onTest} disabled={state === "testing"} variant="secondary">
              {state === "testing" && <Loader2 className="size-4 animate-spin" />}
              {state === "valid" ? "Check again" : "Check it works"}
            </Button>
            {state === "valid" && (
              <span className="flex items-center gap-1.5 text-sm text-primary">
                <Check className="size-4" /> {message}
              </span>
            )}
            {state === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-destructive">
                <XCircle className="size-4" /> {message}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Supabase: verify the database tables exist before advancing */}
      {step.key === "supabase" && !alreadyConnected && connected && onCheckSchema && (
        <div
          className={`space-y-3 rounded-lg border p-5 ${
            schemaReady ? "border-primary/40 bg-primary/5" : "border-border bg-card"
          }`}
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-primary">Last check</p>
            <h4 className="mt-1 font-medium">Make sure your tables are set up</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Run the setup code (step 2 above) in Supabase, then check here. Sign-up won&apos;t
              work without these tables, so we confirm them before moving on.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={onCheckSchema} disabled={checkingSchema}>
              {checkingSchema && <Loader2 className="size-4 animate-spin" />}
              {schemaReady ? "Re-check tables" : "Check my tables"}
            </Button>
            {schemaResult && (
              <span
                className={`flex items-center gap-1.5 text-sm ${
                  schemaResult.ok ? "text-primary" : "text-destructive"
                }`}
              >
                {schemaResult.ok ? <Check className="size-4" /> : <XCircle className="size-4" />}
                {schemaResult.message}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stripe shortcut: create the plans automatically */}
      {step.key === "stripe" && !alreadyConnected && onCreatePlans && (
        <div className="space-y-3 rounded-lg border border-secondary/40 bg-secondary/5 p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-secondary">Shortcut</p>
            <h4 className="mt-1 font-medium">Let me create your plans for you</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              With your secret key in the box above, click here and the app will create the
              products and prices in Stripe and fill in the Price IDs automatically — so you can
              skip creating them by hand.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={onCreatePlans} disabled={creatingPlans}>
            {creatingPlans && <Loader2 className="size-4 animate-spin" />}
            Create my plans in Stripe
          </Button>
          {plansResult && (
            <p className={`text-sm ${plansResult.ok ? "text-primary" : "text-destructive"}`}>
              {plansResult.message}
            </p>
          )}
        </div>
      )}

      {alreadyConnected && (
        <p className="rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          This is already connected. Continue, or update the details above.
        </p>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <div className="flex items-center gap-2">
          {!step.required && (
            <Button variant="outline" onClick={onSkip}>
              Skip for now
            </Button>
          )}
          <Button onClick={onNext} disabled={!canAdvance}>
            Continue <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Explainer({ label, body, muted }: { label: string; body: string; muted?: boolean }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wide text-primary">{label}</p>
      <p className={`mt-1 text-sm ${muted ? "text-muted-foreground" : "text-foreground/90"}`}>{body}</p>
    </div>
  );
}

/** Show only the editable middle of an assembled value (strip prefix/suffix). */
function middleOf(full: string | undefined, a: { prefix: string; suffix: string }) {
  let v = full ?? "";
  if (v.startsWith(a.prefix)) v = v.slice(a.prefix.length);
  if (v.endsWith(a.suffix)) v = v.slice(0, -a.suffix.length);
  return v;
}

/** Build the whole value from the typed middle, tolerating a pasted full URL. */
function assemble(input: string, a: { prefix: string; suffix: string }) {
  let mid = input.trim();
  // If they paste the full thing, strip the parts we add back ourselves.
  mid = mid
    .replace(/^https?:\/\//, "")
    .replace(new RegExp(`${a.suffix.replace(/[.]/g, "\\.")}/?$`), "")
    .replace(/\/$/, "");
  return mid ? `${a.prefix}${mid}${a.suffix}` : "";
}

/** Build a .env-style block from entered values, for pasting into a host. */
function buildEnvBlock(values: Record<string, string>): string {
  const keys = [
    "NEXT_PUBLIC_SITE_URL",
    ...SETUP_STEPS.flatMap((s) => s.fields.map((f) => f.name)),
  ];
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const k of keys) {
    if (seen.has(k)) continue;
    seen.add(k);
    const raw =
      k === "NEXT_PUBLIC_SITE_URL"
        ? values[k]?.trim() || (typeof location !== "undefined" ? location.origin : "")
        : values[k]?.trim();
    if (raw) lines.push(`${k}=${raw}`);
  }
  return lines.join("\n");
}

/** Mask secret values for on-screen display (the copy button uses the real block). */
function maskEnvBlock(block: string): string {
  return block
    .split("\n")
    .map((line) => {
      const eq = line.indexOf("=");
      const key = line.slice(0, eq);
      const val = line.slice(eq + 1);
      if (key.startsWith("NEXT_PUBLIC_")) return line;
      return `${key}=${val.slice(0, 6)}${val.length > 6 ? "…" : ""}`;
    })
    .join("\n");
}

function mapState(done: Record<string, boolean>): Record<string, ValidState> {
  const out: Record<string, ValidState> = {};
  for (const [k, v] of Object.entries(done)) out[k] = v ? "valid" : "idle";
  return out;
}

async function waitForConfigured(attempts = 12) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch("/api/setup", { cache: "no-store" });
      const data = await res.json();
      const supabase = data.status?.find((s: IntegrationStatus) => s.key === "supabase");
      if (supabase?.configured) return;
    } catch {
      /* server may be restarting */
    }
    await new Promise((r) => setTimeout(r, 800));
  }
}
