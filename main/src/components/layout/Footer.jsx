// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";


export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-300 pt-14 pb-10 mt-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white">NoteSwap</h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Buy, sell, and trade musical gear with musicians across the country.
          </p>

          <div className="flex gap-4 mt-5 text-xl">
            <a href="#" className="hover:text-white transition">🐦</a>
            <a href="#" className="hover:text-white transition">📘</a>
            <a href="#" className="hover:text-white transition">📸</a>
            <a href="#" className="hover:text-white transition">▶️</a>
          </div>
        </div>

        {/* Marketplace */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-400 mb-4">
            Marketplace
          </h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Browse Listings</a></li>
            <li><a href="#" className="hover:text-white">Sell Your Gear</a></li>
            <li><a href="#" className="hover:text-white">Categories</a></li>
            <li><a href="#" className="hover:text-white">Verified Sellers</a></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-400 mb-4">
            Company
          </h3>
          <div className="flex flex-col gap-3">
            <Link to="/about" className="hover:text-white">About Us</Link>
            <Link to="/careers" className="hover:text-white">Careers</Link>
            <a href="#" className="hover:text-white">Press</a>
            <a href="#" className="hover:text-white">Blog</a>
           </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-400 mb-4">
            Support
          </h3>
          <div className="flex flex-col gap-3">
            <Link to="/helpcenter" className="hover:text-white">Help Center</Link>
            <Link to="/contact" className="hover:text-white">Contact Support</Link>
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} NoteSwap. All rights reserved.
      </div>
    </footer>
  );
}
