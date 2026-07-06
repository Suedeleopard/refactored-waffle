import { Logo } from "@/components/logo";

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="brand-glow min-h-svh">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-6">
          <Logo />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>
    </div>
  );
}
