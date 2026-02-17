/**
 * Export Prep Guide to PDF (Premium Feature)
 * 
 * Generates a printable PDF with Sunday meal prep instructions
 */

import { MealPrepGuide } from "../core/logic/MealPrepGuide";
import { WeeklyPlan } from "../core/models/WeeklyPlan";

// Re-export from core/logic
export { exportPrepGuidePdf, downloadPrepGuidePdf } from "../core/logic/exportPrepGuidePdf";
export type { PdfExportOptions } from "../core/logic/exportPrepGuidePdf";

/**
 * Legacy function - wrapper around exportPrepGuidePdf
 * @deprecated Use exportPrepGuidePdf instead
 */
export function exportPrepGuideToPdf(
  prepGuide: MealPrepGuide,
  weeklyPlan: WeeklyPlan
): void {
  console.log("🖨️ Exporting Prep Guide to PDF...");
  console.log("📋 Guide:", prepGuide);
  console.log("📅 Plan:", weeklyPlan);

  // TODO: Implement PDF generation using jsPDF or similar
  // For now, show alert
  alert(`
🖨️ Prep Guide PDF Export (Premium Feature)

Total Time: ${prepGuide.totalPrepTime}
Servings: ${prepGuide.servingsProduced} meals
Difficulty: ${prepGuide.difficulty}

${prepGuide.cookingTasks.length} cooking tasks ready to print!

This feature will generate a printable PDF with:
- Step-by-step cooking instructions
- Ingredient quantities
- Time estimates
- Pro tips for efficient prep

Coming soon! 🎉
  `.trim());

  console.log("✅ PDF export completed (stub)");
}
