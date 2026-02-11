/**
 * exportShoppingListPdf.ts
 * Premium Feature: Export shopping list to PDF
 * 
 * Purpose: Generate printable/shareable grocery list for users
 * Use case: Print for store visit, share via WhatsApp, archive planning
 * 
 * Source: PDF/Print value in UX
 * https://www.nngroup.com/articles/printability/
 */

import { jsPDF } from "jspdf";
import { FoodItem, FoodCategory } from "../models/FoodItem";
import { formatQuantity } from "../utils/formatQuantity";

interface ExportOptions {
  proteinTarget: number;
  totalCost: number;
  personName?: string;
}

/**
 * Group items by category for structured PDF layout
 */
function groupByCategory(items: FoodItem[]): Record<FoodCategory, FoodItem[]> {
  const grouped: Record<string, FoodItem[]> = {};

  items.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  return grouped as Record<FoodCategory, FoodItem[]>;
}

/**
 * Category icons and labels for PDF
 */
const CATEGORY_INFO: Record<FoodCategory, { emoji: string; label: string }> = {
  vegetables: { emoji: "🥬", label: "Vegetables" },
  fruits: { emoji: "🍎", label: "Fruits" },
  proteins: { emoji: "🍗", label: "Proteins" },
  grains: { emoji: "🌾", label: "Grains" },
  dairy: { emoji: "🥛", label: "Dairy" },
  oils: { emoji: "🫒", label: "Oils" },
  spices: { emoji: "🌶️", label: "Spices" },
  beverages: { emoji: "☕", label: "Beverages" },
  others: { emoji: "📦", label: "Others" },
};

/**
 * Export shopping list to PDF
 * Generates formatted grocery list ready for print/share
 */
export function exportShoppingListPdf(
  shoppingList: FoodItem[],
  options: ExportOptions
): void {
  const { proteinTarget, totalCost, personName } = options;

  // Create PDF document (A4, portrait)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = 20;

  // === HEADER ===
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("SmartMarket Planner", margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Weekly Grocery List", margin, yPosition);

  if (personName) {
    yPosition += 7;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Prepared for: ${personName}`, margin, yPosition);
    doc.setTextColor(0, 0, 0);
  }

  // === FITNESS SUMMARY ===
  yPosition += 15;
  doc.setFillColor(102, 126, 234); // Brand color
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`🎯 Protein Target: ${proteinTarget}g/day`, margin + 5, yPosition + 5);
  doc.text(`💰 Total Cost: €${totalCost.toFixed(2)}`, pageWidth - margin - 60, yPosition + 5);
  
  doc.setTextColor(0, 0, 0);
  yPosition += 25;

  // === ITEMS BY CATEGORY ===
  const groupedItems = groupByCategory(shoppingList);
  const categories = Object.keys(groupedItems) as FoodCategory[];

  categories.forEach((category) => {
    const items = groupedItems[category];
    if (!items || items.length === 0) return;

    const { emoji, label } = CATEGORY_INFO[category];

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Category header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${emoji} ${label}`, margin, yPosition);
    yPosition += 8;

    // Items
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    items.forEach((item) => {
      // Check page overflow
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      // Checkbox
      doc.rect(margin, yPosition - 3, 4, 4);

      // Item name
      doc.setFont("helvetica", "bold");
      doc.text(item.name, margin + 8, yPosition);

      // Quantity (formatted)
      const quantityText = formatQuantity(
        item.name,
        item.quantity,
        item.unit as "kg" | "unit" | "pack" | "can"
      );
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(quantityText, margin + 8, yPosition + 4);

      // Price
      if (item.estimatedPrice) {
        doc.setTextColor(76, 175, 80); // Green
        doc.text(`€${item.estimatedPrice.toFixed(2)}`, pageWidth - margin - 25, yPosition);
      }

      // Reason (italic, smaller)
      if (item.reason) {
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        const reasonText = item.reason.length > 60 
          ? item.reason.substring(0, 57) + "..." 
          : item.reason;
        doc.text(reasonText, margin + 8, yPosition + 8);
        doc.setFontSize(10);
      }

      doc.setTextColor(0, 0, 0);
      yPosition += item.reason ? 14 : 10;
    });

    yPosition += 5; // Space between categories
  });

  // === FOOTER ===
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by SmartMarket Planner - Page ${i}/${pageCount}`,
      pageWidth / 2,
      285,
      { align: "center" }
    );
  }

  // === DOWNLOAD ===
  const timestamp = new Date().toISOString().split("T")[0];
  doc.save(`SmartMarket-GroceryList-${timestamp}.pdf`);
}
