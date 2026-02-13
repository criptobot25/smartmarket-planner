import { NavLink } from "react-router-dom";
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
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/app" className="navbar-logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">SmartMarket</span>
        </NavLink>

        {/* Navigation Links - Only 2 core pages */}
        <div className="navbar-links">
          <NavLink 
            to="/app" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            end
          >
            Planner
          </NavLink>
          
          <NavLink 
            to="/app/list" 
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
          >
            Shopping List
          </NavLink>
        </div>

        {/* CTA */}
        <div className="navbar-cta">
          <NavLink to="/app/premium" className="btn-premium-nav">
            Upgrade
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
