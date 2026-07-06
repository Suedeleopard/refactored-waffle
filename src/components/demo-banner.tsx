/*
  Dev-only signpost. Renders nothing in production, so it can never show to your
  customers. While you're building, it's a constant reminder that the on-screen
  name, copy, and pricing are EXAMPLES from src/lib/config.ts — edit that file to
  make the app yours. Delete this component once you no longer need the reminder.
*/
export function DemoBanner() {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="w-full bg-primary/15 px-4 py-1.5 text-center font-mono text-xs text-primary">
      Example content — you&apos;re running the unmodified TSC&nbsp;Starter. Edit{" "}
      <span className="font-semibold">src/lib/config.ts</span> to make it yours. (Dev only — hidden in production.)
    </div>
  );
}
