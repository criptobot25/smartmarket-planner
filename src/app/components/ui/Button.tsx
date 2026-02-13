import React from "react";
import "./Button.css";

/**
 * Button Component - Design System
 * 
 * Reusable button component with consistent styling across the app.
 * Uses design tokens for colors, radius, shadows, and typography.
 * 
 * Usage:
 * <Button variant="primary">Click me</Button>
 * <Button variant="secondary">Secondary action</Button>
 * 
 * Props:
 * - variant: "primary" (default) or "secondary"
 * - className: Additional CSS classes
 * - All standard button HTML attributes (onClick, disabled, etc.)
 */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ 
  variant = "primary", 
  className = "", 
  children,
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`ui-button ui-button-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
