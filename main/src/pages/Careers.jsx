import { Link } from "react-router-dom";

export default function Careers() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-slate-800">
      
      {/* Header */}
      <section className="text-center mb-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Careers at NoteSwap
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          We're building the future of the musical marketplace — but we’re not hiring at the moment.
        </p>
      </section>

      {/* No Openings */}
      <section className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm text-center">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          No Current Openings
        </h2>
        <p className="text-slate-600 leading-relaxed max-w-xl mx-auto">
          We appreciate your interest in joining NoteSwap.  
          At this time, we don’t have any open positions available.  
          Please check back in the future as our team continues to grow.
        </p>
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
