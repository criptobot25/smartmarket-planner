import jsPDF from 'jspdf';
import { FoodItem } from '../core/models/FoodItem';
import { CostTier } from '../core/models/CostTier';

/**
 * Export Shopping List to PDF
 * 
 * Premium feature that generates a professional PDF shopping list
 * optimized for:
 * - Printing
 * - WhatsApp sharing
 * - Supermarket usage
 * 
 * Includes:
 * - Items organized by category
 * - Quantities and costs
 * - Total cost and savings
 * - Protein totals
 * - Formatted for easy scanning
 * 
 * Source: PDF/print usability
 * https://www.nngroup.com/articles/printability/
 */

interface ExportPdfOptions {
  items: FoodItem[];
  costTier: CostTier;
  totalProtein?: number;
  savingsStatus?: string;
  substitutionsApplied?: Array<{
    from: string;
    to: string;
    savings: number;
  }>;
  fitnessGoal?: string;
}

/**
 * Group items by category for organized display
 */
function groupByCategory(items: FoodItem[]): Map<string, FoodItem[]> {
  const grouped = new Map<string, FoodItem[]>();
  
  for (const item of items) {
    const category = item.category || 'other';
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(item);
  }
  
  return grouped;
}

/**
 * Format category name for display
 */
function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    proteins: '🥩 Proteins',
    grains: '🌾 Grains & Carbs',
    vegetables: '🥦 Vegetables',
    fruits: '🍎 Fruits',
    dairy: '🥛 Dairy',
    fats: '🥑 Fats & Oils',
    other: '📦 Other',
  };
  
  return names[category] || category;
}

/**
 * Generate and download PDF shopping list
 */
export function exportShoppingListToPdf(options: ExportPdfOptions): void {
  const {
    items,
    costTier,
    totalProtein = 0,
    savingsStatus = 'unknown',
    substitutionsApplied = [],
    fitnessGoal = 'maintenance'
  } = options;

  const costTierLabelMap = {
    low: "Low cost",
    medium: "Medium cost",
    high: "High cost"
  } as const;

  const doc = new jsPDF();
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const leftMargin = 15;
  const rightMargin = pageWidth - 15;
  
  // HEADER
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SmartMarket Shopping List', leftMargin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Fitness Goal: ${fitnessGoal.charAt(0).toUpperCase() + fitnessGoal.slice(1)}`, leftMargin, yPosition);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, rightMargin, yPosition, { align: 'right' });
  
  yPosition += 15;
  
  // SUMMARY BOX
  doc.setFillColor(240, 253, 244); // Light green
  doc.rect(leftMargin, yPosition - 5, pageWidth - 30, 25, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Cost Tier: ${costTierLabelMap[costTier]}`, leftMargin + 5, yPosition + 5);
  
  if (totalProtein > 0) {
    doc.text(`Total Protein: ${Math.round(totalProtein)}g`, leftMargin + 5, yPosition + 12);
  }
  
  if (savingsStatus === 'adjusted_to_savings') {
    doc.setFontSize(10);
    doc.setTextColor(5, 150, 105); // Green
    doc.text(`✓ Smart Savings applied`, leftMargin + 5, yPosition + 18);
  }
  
  yPosition += 35;
  
  // SUBSTITUTIONS (if any)
  if (substitutionsApplied.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('💰 Optimizations Applied:', leftMargin, yPosition);
    yPosition += 7;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    for (const sub of substitutionsApplied.slice(0, 3)) {
      doc.text(`• ${sub.from} → ${sub.to} (saved €${sub.savings.toFixed(2)})`, leftMargin + 3, yPosition);
      yPosition += 5;
    }
    
    yPosition += 5;
  }
  
  // ITEMS BY CATEGORY
  const grouped = groupByCategory(items);
  
  for (const [category, categoryItems] of grouped) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Category header
    doc.setFillColor(249, 250, 251);
    doc.rect(leftMargin, yPosition - 4, pageWidth - 30, 8, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(formatCategoryName(category), leftMargin + 2, yPosition + 2);
    
    yPosition += 10;
    
    // Items in category
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    for (const item of categoryItems) {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const itemName = item.name;
      const quantity = `${item.quantity}${item.unit}`;
      const price = `€${(item.estimatedPrice || 0).toFixed(2)}`;
      
      // Item name
      doc.text(`• ${itemName}`, leftMargin + 3, yPosition);
      
      // Quantity (centered)
      doc.text(quantity, pageWidth / 2, yPosition, { align: 'center' });
      
      // Price (right-aligned)
      doc.text(price, rightMargin, yPosition, { align: 'right' });
      
      yPosition += 5;
    }
    
    yPosition += 3;
  }
  
  // FOOTER
  yPosition = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by SmartMarket Planner - smartmarket.app', pageWidth / 2, yPosition, { align: 'center' });
  
  // Download
  const filename = `shopping-list-${fitnessGoal}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
