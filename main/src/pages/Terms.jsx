import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-slate-800">

      {/* Header */}
      <section className="text-center mb-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Terms of Service
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Please read these terms carefully before using NoteSwap. By accessing or using our platform, you agree to these Terms of Service.
        </p>
      </section>

      {/* Section: Use of the Platform */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Use of the Platform
        </h2>
        <p className="text-slate-700 leading-relaxed">
          You agree to use NoteSwap only for lawful purposes and in accordance with these terms.
          You may not misuse the platform, attempt unauthorized access, or engage in activities
          that harm other users or the integrity of the marketplace.
        </p>
      </section>

      {/* Section: User Accounts */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          User Accounts
        </h2>
        <p className="text-slate-700 leading-relaxed">
          To access certain features, you may need to create an account. You are responsible for
          maintaining the confidentiality of your login information and for all activity that occurs
          under your account.
        </p>
      </section>

      {/* Section: Listings and Transactions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Listings and Transactions
        </h2>
        <p className="text-slate-700 leading-relaxed">
          NoteSwap provides a platform for users to buy and sell musical instruments. We do not
          own, inspect, or guarantee the items listed. All transactions are solely between buyers
          and sellers. Users are responsible for ensuring accuracy, honesty, and safety during
          interactions and exchanges.
        </p>
      </section>

      {/* Section: Prohibited Activities */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Prohibited Activities
        </h2>
        <p className="text-slate-700 leading-relaxed">
          You may not engage in fraudulent behavior, post misleading information, harass other
          users, or attempt to interfere with the platform’s functionality. Violations may result
          in account suspension or removal.
        </p>
      </section>

      {/* Section: Limitation of Liability */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Limitation of Liability
        </h2>
        <p className="text-slate-700 leading-relaxed">
          NoteSwap is provided “as is” without warranties of any kind. We are not responsible for
          damages arising from use of the platform, including issues related to transactions,
          listings, or user interactions.
        </p>
      </section>

      {/* Section: Changes to Terms */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Changes to These Terms
        </h2>
        <p className="text-slate-700 leading-relaxed">
          We may update these Terms of Service from time to time. Continued use of the platform
          after changes are posted constitutes acceptance of the updated terms.
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
