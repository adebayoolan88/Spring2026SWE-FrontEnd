export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <h2 className="site-footer__brand">NoteSwap</h2>
          <p className="site-footer__description">
            Buy, sell, and trade musical gear with musicians across the country.
          </p>

          <div className="site-footer__socials" aria-label="Social links">
            <a href="#" className="site-footer__social-link" aria-label="Twitter">🐦</a>
            <a href="#" className="site-footer__social-link" aria-label="Facebook">📘</a>
            <a href="#" className="site-footer__social-link" aria-label="Instagram">📸</a>
            <a href="#" className="site-footer__social-link" aria-label="YouTube">▶️</a>
          </div>
        </div>

        <div>
          <h3 className="site-footer__heading">Marketplace</h3>
          <ul className="site-footer__list">
            <li><a href="#" className="site-footer__link">Browse Listings</a></li>
            <li><a href="#" className="site-footer__link">Sell Your Gear</a></li>
            <li><a href="#" className="site-footer__link">Categories</a></li>
            <li><a href="#" className="site-footer__link">Verified Sellers</a></li>
          </ul>
        </div>

        <div>
          <h3 className="site-footer__heading">Company</h3>
          <div className="site-footer__stack">
            <a href="/about" className="site-footer__link">About Us</a>
            <a href="/careers" className="site-footer__link">Careers</a>
            <a href="#" className="site-footer__link">Press</a>
            <a href="#" className="site-footer__link">Blog</a>
          </div>
        </div>

        <div>
          <h3 className="site-footer__heading">Support</h3>
          <div className="site-footer__stack">
            <a href="/helpcenter" className="site-footer__link">Help Center</a>
            <a href="/contact" className="site-footer__link">Contact Support</a>
            <a href="/privacy" className="site-footer__link">Privacy Policy</a>
            <a href="/terms" className="site-footer__link">Terms of Service</a>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        © {new Date().getFullYear()} NoteSwap. All rights reserved.
      </div>
    </footer>
  );
}
