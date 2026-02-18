import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Navbar.css";

/**
 * Clean Navbar - Only 3 core links
 * 
 * Structure:
 * - Logo → /app (Planner)
 * - Planner → /app
 * - Shopping List → /app/list
 * - Upgrade (CTA) → /app/premium
 * 
 * Removed: Weekly Plan, History, Recipes (redundant/not core)
 * 
 * Source: Navigation consistency
 * https://www.nngroup.com/articles/consistency-and-standards/
 */
export function Navbar() {
  const { t, i18n } = useTranslation();

  const handleLangChange = (lang: "en" | "pt") => {
    if (i18n.language === lang) return;
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/app" className="navbar-logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">{t("app.name")}</span>
        </NavLink>

        {/* Navigation Links */}
        <div className="navbar-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            🏠 Home
          </NavLink>
          
          <NavLink 
            to="/app" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            end
          >
            {t("landing.footerPlanner")}
          </NavLink>
          
          <NavLink 
            to="/app/list" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            {t("shoppingList.pageTitle")}
          </NavLink>
        </div>

        {/* CTA */}
        <div className="navbar-cta">
          <NavLink to="/app/premium" className="btn-premium-nav">
            {t("landing.footerPremium")}
          </NavLink>
        </div>

        {/* Language Switcher */}
        <div className="lang-switcher">
          <button
            type="button"
            className={`lang-btn ${i18n.language === "en" ? "active" : ""}`}
            onClick={() => handleLangChange("en")}
            aria-label={t("lang.english")}
          >
            EN
          </button>
          <span className="lang-separator">|</span>
          <button
            type="button"
            className={`lang-btn ${i18n.language === "pt" ? "active" : ""}`}
            onClick={() => handleLangChange("pt")}
            aria-label={t("lang.portuguese")}
          >
            PT
          </button>
        </div>
      </div>
    </nav>
  );
}
