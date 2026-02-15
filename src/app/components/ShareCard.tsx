/**
 * PASSO 33.3: Viral Share Card Generator
 * ========================================
 * 
 * Instagram-ready share card with premium Apple-like design.
 * 
 * FEATURES:
 * - Beautiful gradient background
 * - Key plan metrics displayed
 * - Watermark for brand visibility
 * - Export to PNG for social sharing
 * 
 * METRICS SHOWN:
 * - Goal (bulking/cutting/maintenance)
 * - Protein per day
 * - Cost tier
 * - Variety score (unique proteins/vegetables)
 * 
 * WHY THIS MATTERS:
 * - Drives organic growth through social sharing
 * - Users proud to share their fitness plans
 * - Professional look increases brand credibility
 * - Viral loop for user acquisition
 */

import { useRef } from "react";
import { toPng } from "html-to-image";
import { WeeklyPlan } from "../../core/models/WeeklyPlan";
import { PlanInput } from "../../core/models/PlanInput";
import "./ShareCard.css";

interface ShareCardProps {
  weeklyPlan: WeeklyPlan | null;
  planInput: PlanInput | null;
  onClose: () => void;
}

export function ShareCard({ weeklyPlan, planInput, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!weeklyPlan || !planInput) {
    return null;
  }

  // Calculate variety score
  const calculateVarietyScore = (): number => {
    if (!weeklyPlan.shoppingList || weeklyPlan.shoppingList.length === 0) {
      return 0;
    }

    const proteins = weeklyPlan.shoppingList.filter(item => item.category === "proteins");
    const vegetables = weeklyPlan.shoppingList.filter(item => item.category === "vegetables");
    
    const uniqueProteins = new Set(proteins.map(p => p.name)).size;
    const uniqueVegetables = new Set(vegetables.map(v => v.name)).size;
    
    // Variety score: average of protein variety (max 10) and vegetable variety (max 15)
    const proteinScore = Math.min(uniqueProteins / 10 * 50, 50);
    const vegetableScore = Math.min(uniqueVegetables / 15 * 50, 50);
    
    return Math.round(proteinScore + vegetableScore);
  };

  // Determine goal label
  const getGoalLabel = (): string => {
    if (planInput.dietStyle === "healthy") return "🎯 Muscle Gain";
    if (planInput.dietStyle === "comfort") return "💪 Bulking";
    return "⚖️ Balanced";
  };

  // Get protein per day
  const proteinPerDay = weeklyPlan.proteinTargetPerDay || 
    Math.round((weeklyPlan.totalProtein || 0) / 7);

  // Get cost tier emoji
  const getCostTierEmoji = (): string => {
    if (weeklyPlan.costTier === "low") return "💰";
    if (weeklyPlan.costTier === "high") return "✨";
    return "💳";
  };

  const varietyScore = calculateVarietyScore();

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High quality for social media
        backgroundColor: "transparent"
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `smartmarket-plan-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();

      console.log("✅ Share card downloaded successfully");
    } catch (error) {
      console.error("❌ Error generating share card:", error);
      alert("Failed to generate share card. Please try again.");
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;

    try {
      const blob = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "transparent"
      }).then(dataUrl => {
        return fetch(dataUrl).then(res => res.blob());
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob
        })
      ]);

      alert("✅ Share card copied to clipboard! Paste it in Instagram.");
      console.log("✅ Share card copied to clipboard");
    } catch (error) {
      console.error("❌ Error copying share card:", error);
      alert("Copy failed. Image has been downloaded instead.");
      handleDownload();
    }
  };

  return (
    <div className="share-card-overlay" onClick={onClose}>
      <div className="share-card-container" onClick={(e) => e.stopPropagation()}>
        {/* Share Card Preview */}
        <div ref={cardRef} className="share-card">
          {/* Background Gradient */}
          <div className="share-card-background"></div>

          {/* Content */}
          <div className="share-card-content">
            {/* Header */}
            <div className="share-card-header">
              <h1 className="share-card-title">My Fitness Plan</h1>
              <p className="share-card-subtitle">Week of {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>

            {/* Metrics Grid */}
            <div className="share-card-metrics">
              <div className="metric-card">
                <div className="metric-icon">{getGoalLabel().split(" ")[0]}</div>
                <div className="metric-label">Goal</div>
                <div className="metric-value">{getGoalLabel().split(" ").slice(1).join(" ")}</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">💪</div>
                <div className="metric-label">Protein/Day</div>
                <div className="metric-value">{proteinPerDay}g</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">{getCostTierEmoji()}</div>
                <div className="metric-label">Budget</div>
                <div className="metric-value">{weeklyPlan.costTier}</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🌈</div>
                <div className="metric-label">Variety</div>
                <div className="metric-value">{varietyScore}/100</div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="share-card-stats">
              <div className="stat-item">
                <span className="stat-label">Calories</span>
                <span className="stat-value">{Math.round(weeklyPlan.caloriesTargetPerDay || 0)}/day</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-label">Items</span>
                <span className="stat-value">{weeklyPlan.shoppingList?.length || 0}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-label">Meals</span>
                <span className="stat-value">{planInput.mealsPerDay}/day</span>
              </div>
            </div>

            {/* Watermark */}
            <div className="share-card-watermark">
              <span className="watermark-logo">📊</span>
              <span className="watermark-text">SmartMarket Planner</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="share-card-actions">
          <button className="btn-share" onClick={handleCopyImage}>
            📋 Copy to Clipboard
          </button>
          <button className="btn-share" onClick={handleDownload}>
            📥 Download Image
          </button>
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
