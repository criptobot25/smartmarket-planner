import Link from "next/link";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="np-footer">
      <div className="np-footer-inner">
        <nav className="np-footer-links" aria-label="Footer navigation">
          <div className="np-footer-col">
            <span className="np-footer-heading">Product</span>
            <Link href="/app">Nutrition Planner</Link>
            <Link href="/meal-plan">Meal Plans</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className="np-footer-col">
            <span className="np-footer-heading">Learn</span>
            <Link href="/blog">Blog</Link>
            <Link href="/faq">FAQ</Link>
          </div>
          <div className="np-footer-col">
            <span className="np-footer-heading">Company</span>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="np-footer-col">
            <span className="np-footer-heading">Legal</span>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </nav>

        <div className="np-footer-bottom">
          <span>© {year} NutriPilot. All rights reserved.</span>
          <span className="np-footer-rss">
            <a href="/rss.xml">RSS Feed</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
