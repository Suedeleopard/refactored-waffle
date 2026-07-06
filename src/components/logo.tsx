import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

/** Wordmark. Swap the mark for an SVG logo per product. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-mono text-sm font-bold">
        {siteConfig.name.charAt(0)}
      </span>
      <span className="font-semibold tracking-tight">{siteConfig.name}</span>
    </Link>
  );
}
