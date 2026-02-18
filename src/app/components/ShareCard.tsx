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
import { useTranslation } from "react-i18next";
import { CATEGORIES } from "../../core/constants/categories";
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
  const { t, i18n } = useTranslation();

  if (!weeklyPlan || !planInput) {
    return null;
  }

  // Calculate variety score
  const calculateVarietyScore = (): number => {
    if (!weeklyPlan.shoppingList || weeklyPlan.shoppingList.length === 0) {
      return 0;
    }

    const proteins = weeklyPlan.shoppingList.filter(item => item.category === CATEGORIES.protein);
    const vegetables = weeklyPlan.shoppingList.filter(item => item.category === CATEGORIES.vegetables);
    
    const uniqueProteins = new Set(proteins.map(p => p.name)).size;
    const uniqueVegetables = new Set(vegetables.map(v => v.name)).size;
    
    // Variety score: average of protein variety (max 10) and vegetable variety (max 15)
    const proteinScore = Math.min(uniqueProteins / 10 * 50, 50);
    const vegetableScore = Math.min(uniqueVegetables / 15 * 50, 50);
    
    return Math.round(proteinScore + vegetableScore);
  };

  // Determine goal label
  const getGoalLabel = (): string => {
    if (planInput.dietStyle === "healthy") return t("shareCard.goal.healthy");
    if (planInput.dietStyle === "comfort") return t("shareCard.goal.comfort");
    return t("shareCard.goal.balanced");
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
      const { toPng } = await import("html-to-image");

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High quality for social media
        backgroundColor: "transparent"
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `nutripilot-plan-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();

      console.log("✅", t("shareCard.console.downloadSuccess"));
    } catch (error) {
      console.error("❌ Error generating share card:", error);
      alert(t("shareCard.alert.generateError"));
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;

    try {
      const { toPng } = await import("html-to-image");

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

      alert(t("shareCard.alert.copySuccess"));
      console.log("✅", t("shareCard.console.copySuccess"));
    } catch (error) {
      console.error("❌ Error copying share card:", error);
      alert(t("shareCard.alert.copyFailed"));
      handleDownload();
    }
  };

  const locale = i18n.language === "pt" ? "pt-BR" : "en-US";
  const weekOfDate = new Date().toLocaleDateString(locale, { month: "short", day: "numeric" });
  const goalLabel = getGoalLabel();
  const [goalEmoji, ...goalTextParts] = goalLabel.split(" ");
  const goalText = goalTextParts.join(" ");

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
              <h1 className="share-card-title">{t("shareCard.title")}</h1>
              <p className="share-card-subtitle">{t("shareCard.weekOf", { date: weekOfDate })}</p>
            </div>

            {/* Metrics Grid */}
            <div className="share-card-metrics">
              <div className="metric-card">
                <div className="metric-icon">{goalEmoji}</div>
                <div className="metric-label">{t("shareCard.metric.goal")}</div>
                <div className="metric-value">{goalText}</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">💪</div>
                <div className="metric-label">{t("shareCard.metric.proteinPerDay")}</div>
                <div className="metric-value">{proteinPerDay}g</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">{getCostTierEmoji()}</div>
                <div className="metric-label">{t("shareCard.metric.budget")}</div>
                <div className="metric-value">{t(`shareCard.costTier.${weeklyPlan.costTier}`)}</div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🌈</div>
                <div className="metric-label">{t("shareCard.metric.variety")}</div>
                <div className="metric-value">{varietyScore}/100</div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="share-card-stats">
              <div className="stat-item">
                <span className="stat-label">{t("shareCard.stat.calories")}</span>
                <span className="stat-value">{Math.round(weeklyPlan.caloriesTargetPerDay || 0)}/day</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-label">{t("shareCard.stat.items")}</span>
                <span className="stat-value">{weeklyPlan.shoppingList?.length || 0}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-label">{t("shareCard.stat.meals")}</span>
                <span className="stat-value">{planInput.mealsPerDay}/day</span>
              </div>
            </div>

            {/* Watermark */}
            <div className="share-card-watermark">
              <span className="watermark-logo">📊</span>
              <span className="watermark-text">NutriPilot</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="share-card-actions">
          <button className="btn-share" onClick={handleCopyImage}>
            📋 {t("shareCard.copy")}
          </button>
          <button className="btn-share" onClick={handleDownload}>
            📥 {t("shareCard.download")}
          </button>
          <button className="btn-close" onClick={onClose}>
            {t("shareCard.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
