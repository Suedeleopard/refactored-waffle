import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy Policy" };

// Placeholder policy — replace with your own before launch. Not legal advice.
export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>
        This is a starter template. Replace this page with your real privacy policy before you
        launch. The notes below describe what {siteConfig.name} typically collects so you have a
        starting point.
      </p>

      <h2>What we collect</h2>
      <p>
        Account information you provide (such as your email address), and billing details handled
        by our payment processor. We also store app data you create while using the service.
      </p>

      <h2>How we use it</h2>
      <p>
        To provide and improve the service, process payments, and contact you about your account.
        We do not sell your personal data.
      </p>

      <h2>Third parties</h2>
      <p>
        We rely on infrastructure providers (for hosting, database, payments, and email) who
        process data on our behalf under their own terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your data? Email{" "}
        <a className="text-secondary hover:underline" href={`mailto:${siteConfig.supportEmail}`}>
          {siteConfig.supportEmail}
        </a>
        .
      </p>
    </>
  );
}
