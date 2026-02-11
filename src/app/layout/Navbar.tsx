import { NavLink } from "react-router-dom";
import "./Navbar.css";

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">SmartMarket</span>
        </NavLink>

        {/* Navigation Links */}
        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Planner
          </NavLink>
          
          <NavLink to="/list" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Shopping List
          </NavLink>
          
          <NavLink to="/plan" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Weekly Plan
          </NavLink>
          
          <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            History
          </NavLink>
        </div>

        {/* CTA */}
        <div className="navbar-cta">
          <NavLink to="/premium" className="btn-premium-nav">
            Upgrade
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
