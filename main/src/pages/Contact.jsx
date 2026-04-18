import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-slate-800">

      {/* Header */}
      <section className="text-center mb-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Contact Support
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Have a question or need help? Send us a message and our team will get back to you.
        </p>
      </section>

      {/* Contact Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <form className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
              placeholder="you@example.com"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Message
            </label>
            <textarea
              rows="5"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-orange-500 focus:ring-orange-500"
              placeholder="How can we help you?"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-orange-500 px-6 py-3 text-white font-medium hover:bg-orange-600 transition"
          >
            Send Message
          </button>

        </form>
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
