import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./components/layout/NavBar";
import Footer from "./components/layout/Footer";

import CartPanel from "./components/ui/CartPanel";
import AuthModal from "./components/ui/AuthModal";

// Pages
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Deals from "./pages/Deals";
import About from "./pages/About";
import HelpCenter from "./pages/HelpCenter";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";




export default function App() {
  const [authMode, setAuthMode] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems] = useState([]);

  const isOverlayOpen = authMode || cartOpen;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      
      {/* Blur wrapper for main content */}
      <div className={isOverlayOpen ? "pointer-events-none select-none blur-[4px]" : ""}>
        
        <NavBar
          onOpenLogin={() => setAuthMode("login")}
          onOpenSignup={() => setAuthMode("signup")}
          onOpenCart={() => setCartOpen(true)}
        />

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/about" element={<About />} />
          <Route path="/helpcenter" element={<HelpCenter />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

        </Routes>

        <Footer />
      </div>

      {/* Cart Panel Overlay */}
      <CartPanel
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
      />

      {/* Auth Modal Overlay */}
      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={setAuthMode}
        />
      )}
    </div>
  );
}
