/**
 * Export Meal Prep Guide PDF
 *
 * Premium feature to export a complete meal prep guide as PDF.
 * Uses jsPDF following the same pattern as exportShoppingListPdfNext.
 */

import { WeeklyPlan, DayPlan, MealType } from "../models/WeeklyPlan";

export interface PdfExportOptions {
  includeShoppingList?: boolean;
  includeMacros?: boolean;
  includeInstructions?: boolean;
  includeTimeline?: boolean;
}

/**
 * Export meal prep guide to PDF (returns Blob)
 */
export async function exportPrepGuidePdf(
  plan: WeeklyPlan,
  options: PdfExportOptions = {}
): Promise<Blob> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 15;
  const right = pageWidth - 15;
  let y = 20;

  const {
    includeShoppingList = true,
    includeMacros = true,
    includeTimeline = true,
  } = options;

  // ───── helpers ─────
  function checkPage(needed: number) {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  }

  function drawSectionHeader(title: string) {
    checkPage(15);
    doc.setFillColor(34, 197, 94);
    doc.rect(left, y - 5, pageWidth - 30, 10, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(title, left + 4, y + 2);
    doc.setTextColor(0, 0, 0);
    y += 12;
  }

  function drawSubHeader(title: string) {
    checkPage(10);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(title, left + 2, y);
    y += 6;
  }

  function drawText(text: string, indent = 0) {
    checkPage(6);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, pageWidth - 30 - indent);
    doc.text(lines, left + 3 + indent, y);
    y += lines.length * 4.5;
  }

  function dayName(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  const mealEmoji: Record<string, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
  };

  // ───── HEADER ─────
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("NutriPilot Meal Prep Guide", left, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    right,
    y,
    { align: "right" }
  );
  y += 12;

  // ───── OVERVIEW BOX ─────
  if (includeMacros) {
    doc.setFillColor(240, 253, 244);
    doc.rect(left, y - 5, pageWidth - 30, 30, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Weekly Overview", left + 5, y + 2);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Calories/day: ${Math.round(plan.caloriesTargetPerDay)} kcal`,
      left + 5,
      y + 9
    );
    doc.text(
      `Protein/day: ${Math.round(plan.proteinTargetPerDay)}g  |  Carbs: ${Math.round(plan.carbsTargetPerDay)}g  |  Fat: ${Math.round(plan.fatTargetPerDay)}g`,
      left + 5,
      y + 15
    );
    doc.text(
      `Cost Tier: ${plan.costTier} | Days: ${plan.days.length}`,
      left + 5,
      y + 21
    );
    y += 38;
  }

  // ───── DAILY MEAL PLANS ─────
  drawSectionHeader("Daily Meal Plans");
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

  for (const dayPlan of plan.days) {
    drawSubHeader(
      `${dayName(dayPlan.day)}${dayPlan.trainingDay ? " - Training Day" : ""}`
    );

    for (const mt of mealTypes) {
      const meal = dayPlan.meals[mt];
      if (!meal) continue;
      checkPage(8);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text(`${mealEmoji[mt] || mt}: ${meal.name}`, left + 5, y);
      y += 5;

      if (meal.portions && meal.portions.length > 0) {
        for (const portion of meal.portions) {
          drawText(`- ${portion.foodId} (${Math.round(portion.gramsNeeded)}g)`, 8);
        }
      }
    }
    y += 4;
  }

  // ───── SHOPPING LIST ─────
  if (includeShoppingList && plan.shoppingList.length > 0) {
    drawSectionHeader("Shopping List");
    const grouped = new Map<string, typeof plan.shoppingList>();
    for (const item of plan.shoppingList) {
      const cat = item.category || "other";
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(item);
    }

    for (const [cat, items] of grouped) {
      drawSubHeader(cat.charAt(0).toUpperCase() + cat.slice(1));
      for (const item of items) {
        checkPage(6);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const price =
          item.estimatedPrice != null
            ? `EUR ${item.estimatedPrice.toFixed(2)}`
            : "";
        doc.text(
          `[ ] ${item.name} - ${item.quantity}${item.unit}`,
          left + 5,
          y
        );
        if (price) {
          doc.text(price, right, y, { align: "right" });
        }
        y += 5;
      }
      y += 2;
    }
  }

  // ───── PREP TIMELINE ─────
  if (includeTimeline) {
    drawSectionHeader("Prep Timeline");
    const steps = [
      "1. Review shopping list and buy all ingredients",
      "2. Wash and chop all vegetables for the week",
      "3. Cook grains in bulk (rice, quinoa, etc.)",
      "4. Prep and cook proteins (grill, bake, or boil)",
      "5. Portion meals into containers for each day",
      "6. Store in refrigerator (3-4 days) or freezer (5+ days)",
      "7. Reheat portions as needed throughout the week",
    ];
    for (const step of steps) {
      drawText(step);
      y += 1;
    }
  }

  // ───── SUBSTITUTIONS ─────
  if (
    plan.substitutionsApplied &&
    plan.substitutionsApplied.length > 0
  ) {
    drawSectionHeader("Smart Substitutions Applied");
    for (const sub of plan.substitutionsApplied) {
      drawText(
        `${sub.from} -> ${sub.to} (saved EUR ${sub.savings.toFixed(2)}, protein impact: ${sub.proteinImpact > 0 ? "+" : ""}${sub.proteinImpact}g)`
      );
    }
  }

  // ───── FOOTER ─────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Generated by NutriPilot - nutripilot.app",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(`Page ${p}/${totalPages}`, right, pageHeight - 10, {
      align: "right",
    });
  }

  return doc.output("blob") as unknown as Blob;
}

/**
 * Export and download meal prep guide PDF
 */
export function downloadPrepGuidePdf(
  plan: WeeklyPlan,
  options: PdfExportOptions = {}
): void {
  exportPrepGuidePdf(plan, options).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meal-prep-guide-${plan.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
