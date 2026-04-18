import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-slate-800">

      {/* Header */}
      <section className="text-center mb-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Your privacy matters to us. This page explains how NoteSwap collects, uses, and protects your information.
        </p>
      </section>

      {/* Section: Information We Collect */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Information We Collect
        </h2>
        <p className="text-slate-700 leading-relaxed">
          We collect information that you provide directly to us, such as when you create an account,
          browse listings, or contact support. This may include your name, email address, and any
          details you choose to share when interacting with the platform.
        </p>
      </section>

      {/* Section: How We Use Your Information */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          How We Use Your Information
        </h2>
        <p className="text-slate-700 leading-relaxed">
          We use your information to operate and improve NoteSwap, personalize your experience,
          communicate with you, and ensure the safety and integrity of our marketplace.
        </p>
      </section>

      {/* Section: Sharing Your Information */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Sharing Your Information
        </h2>
        <p className="text-slate-700 leading-relaxed">
          We do not sell your personal information. We may share limited data with trusted service
          providers who help us operate the platform, but only when necessary and always with
          appropriate safeguards in place.
        </p>
      </section>

      {/* Section: Data Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Data Security
        </h2>
        <p className="text-slate-700 leading-relaxed">
          We take reasonable measures to protect your information from unauthorized access, loss,
          or misuse. However, no online service can guarantee complete security.
        </p>
      </section>

      {/* Section: Your Choices */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Your Choices
        </h2>
        <p className="text-slate-700 leading-relaxed">
          You may update or delete your account information at any time. You can also contact us if
          you have questions about how your data is handled.
        </p>
      </section>

      {/* Section: Updates */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Updates to This Policy
        </h2>
        <p className="text-slate-700 leading-relaxed">
          We may update this Privacy Policy from time to time. When we do, we will revise the
          “Last Updated” date at the bottom of the page.
        </p>
      </section>

      {/* Last Updated */}
      <p className="text-sm text-slate-500 mt-8">
        Last Updated: April 2026
      </p>

      {/* Back to Home */}
      <div className="text-center mt-12">
        <Link
          to="/"
          className="inline-block rounded-lg bg-slate-900 px-6 py-3 text-white font-medium hover:bg-slate-700 transition"
        >
          ← Back to Home
        </Link>
      </div>

    </main>
  );
}
