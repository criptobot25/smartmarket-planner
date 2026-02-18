import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoNutriPilot from "../../assets/logo-nutripilot.svg";
import "./Navbar.css";

/**
 * Clean Navbar - Only 3 core links
 * 
 * Structure:
 * - Logo → /app (Nutrition Plan)
 * - Nutrition Plan → /app
 * - Grocery Mission → /app/list
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
          <img src={logoNutriPilot} alt="NutriPilot" className="navbar-logo-image" />
        </NavLink>

        {/* Navigation Links */}
        <div className="navbar-links">
          <NavLink 
            to="/app" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            end
          >
            {t("nav.nutritionPlan")}
          </NavLink>
          
          <NavLink 
            to="/app/list" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            {t("nav.groceryMission")}
          </NavLink>

          <NavLink
            to="/app/prep-guide"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            {t("nav.mondayPrep")}
          </NavLink>
        </div>

        {/* CTA */}
        <div className="navbar-cta">
          <NavLink to="/pricing" className="btn-premium-nav">
            {t("nav.premium")}
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
