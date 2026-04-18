import { Link } from "react-router-dom";

export default function HelpCenter() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-slate-800">

      {/* Header */}
      <section className="text-center mb-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Help Center
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Need assistance? Browse common topics or reach out to our support team.
        </p>
      </section>

      {/* Help Topics */}
      <section className="grid gap-6 md:grid-cols-2">
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Account & Login</h2>
          <p className="text-slate-600 text-sm">
            Learn how to create an account, reset your password, and manage your profile.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Buying Instruments</h2>
          <p className="text-slate-600 text-sm">
            Tips for browsing listings, comparing items, and making safe purchases.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Selling Instruments</h2>
          <p className="text-slate-600 text-sm">
            How to create listings, set prices, and communicate with buyers.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Payments & Safety</h2>
          <p className="text-slate-600 text-sm">
            Learn about secure payments, scams to avoid, and safe meetup tips.
          </p>
        </div>

      </section>

      {/* Contact Support */}
      <section className="text-center mt-16">
        <h3 className="text-2xl font-semibold text-slate-900 mb-3">
          Still need help?
        </h3>
        <p className="text-slate-600 mb-6">
          Our team is here to assist you with any questions or issues.
        </p>

       <Link
         to="/contact"
         className="inline-block rounded-lg bg-orange-500 px-6 py-3 text-white font-medium hover:bg-orange-600 transition"
      >
  Contact Support
</Link>

      </section>

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
