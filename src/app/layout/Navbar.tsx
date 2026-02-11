import { NavLink } from "react-router-dom";
import "./Navbar.css";

export function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-link">
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Planner</span>
      </NavLink>
      
      <NavLink to="/list" className="nav-link">
        <span className="nav-icon">🛒</span>
        <span className="nav-label">Lista</span>
      </NavLink>
      
      <NavLink to="/recipes" className="nav-link">
        <span className="nav-icon">🍳</span>
        <span className="nav-label">Receitas</span>
      </NavLink>
      
      <NavLink to="/history" className="nav-link">
        <span className="nav-icon">📚</span>
        <span className="nav-label">Histórico</span>
      </NavLink>

      <NavLink to="/premium" className="nav-link premium-nav">
        <span className="nav-icon">✨</span>
        <span className="nav-label">Premium</span>
      </NavLink>
    </nav>
  );
}
