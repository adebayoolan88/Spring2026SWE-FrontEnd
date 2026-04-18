import { Link } from "react-router-dom";


export default function About() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-slate-800">
      
      {/* Header */}
      <section className="text-center mb-14">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          About NoteSwap
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          A modern marketplace built for musicians — by musicians.  
          Buy, sell, and discover instruments with confidence.
        </p>
      </section>

      {/* Mission */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Our Mission
        </h2>
        <p className="text-slate-700 leading-relaxed">
          NoteSwap was created to make it easier for musicians to find the gear they need 
          without the hassle of overpriced retail stores or unreliable online listings.  
          Whether you're a beginner picking up your first instrument or a touring musician 
          searching for your next upgrade, NoteSwap gives you a trusted space to explore 
          high‑quality listings from real people.
        </p>
      </section>

      {/* Why NoteSwap */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Why NoteSwap?
        </h2>

        <ul className="space-y-4 text-slate-700">
          <li className="flex gap-3">
            <span className="text-orange-500 font-bold">•</span>
            A curated marketplace focused entirely on musical instruments.
          </li>
          <li className="flex gap-3">
            <span className="text-orange-500 font-bold">•</span>
            Transparent listings with clear condition, pricing, and seller info.
          </li>
          <li className="flex gap-3">
            <span className="text-orange-500 font-bold">•</span>
            Tools that help you compare, search, and filter gear effortlessly.
          </li>
          <li className="flex gap-3">
            <span className="text-orange-500 font-bold">•</span>
            A community-driven platform built for musicians at every level.
          </li>
        </ul>
      </section>

      {/* Vision */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
          Our Vision
        </h2>
        <p className="text-slate-700 leading-relaxed">
          We believe every musician deserves access to the right tools to express their 
          creativity. Our goal is to build the most trusted, intuitive, and community‑focused 
          platform for buying and selling instruments — making music more accessible for 
          everyone.
        </p>
      </section>

      {/* Closing */}
      <section className="text-center mt-20">
        <h3 className="text-xl font-semibold text-slate-900">
          Built for musicians. Powered by community.
        </h3>
        <p className="mt-3 text-slate-600">
          Thanks for being part of NoteSwap.
        </p>
      </section>

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
