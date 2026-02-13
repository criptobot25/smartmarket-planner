import React from "react";
import "./Card.css";

/**
 * Card Component - Design System
 * 
 * Reusable card component with consistent styling across the app.
 * Uses design tokens for spacing, radius, shadows, and colors.
 * 
 * Usage:
 * <Card title="My Card">
 *   <p>Content goes here</p>
 * </Card>
 * 
 * Props:
 * - title: Optional header text
 * - children: Card content
 * - className: Additional CSS classes
 */

type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`ui-card ${className}`}>
      {title && (
        <h2 className="ui-card-title">{title}</h2>
      )}
      <div className={title ? "ui-card-content" : ""}>
        {children}
      </div>
    </div>
  );
}
