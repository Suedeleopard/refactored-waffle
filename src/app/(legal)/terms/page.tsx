import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Terms of Service" };

// Placeholder terms — replace with your own before launch. Not legal advice.
export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>
        This is a starter template. Replace this page with your real terms before you launch. The
        notes below are a plain-language starting point for {siteConfig.name}.
      </p>

      <h2>Using the service</h2>
      <p>
        You&apos;re responsible for your account and for keeping your login secure. Don&apos;t use
        the service to break the law or abuse others.
      </p>

      <h2>Billing</h2>
      <p>
        Paid plans renew automatically until cancelled. You can manage or cancel your plan any time
        from your account page. Fees are non-refundable except where required by law.
      </p>

      <h2>Availability</h2>
      <p>
        We aim to keep the service running but provide it &ldquo;as is&rdquo;, without warranties.
        We may change or discontinue features over time.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a className="text-secondary hover:underline" href={`mailto:${siteConfig.supportEmail}`}>
          {siteConfig.supportEmail}
        </a>
        .
      </p>
    </>
  );
}
