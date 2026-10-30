import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Yoga Write Code team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <main className="bg-canvas">
        <div className="mx-auto max-w-2xl px-5 py-20 font-sans sm:px-8 sm:py-28">
          <h1 className="font-heading text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
            Contact us
          </h1>
          <p className="mt-4 text-lg text-ink-secondary">
            Questions, feedback, or partnership ideas? We&apos;d love to hear from you.
          </p>

          <ContactForm />

          <p className="mt-8 text-sm text-ink-muted">
            Prefer email directly? Write to{" "}
            <a href="mailto:hello@yogawritecode.com" className="font-medium text-brand underline underline-offset-4">
              hello@yogawritecode.com
            </a>
            .
          </p>
        </div>
      </main>
    </>
  );
}
