import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

/** Public marketing nav. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <Link href="/teardowns" className="hover:text-foreground transition-colors">
            Teardowns
          </Link>
          <Link href="/#method" className="hover:text-foreground transition-colors">
            The method
          </Link>
          <Link href="/#kit" className="hover:text-foreground transition-colors">
            The Kit
          </Link>
          <Link href="/sprint" className="hover:text-foreground transition-colors">
            Pitch Sprint
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
