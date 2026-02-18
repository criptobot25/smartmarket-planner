import { describe, expect, it } from "vitest";
import { createInstance } from "i18next";
import { initReactI18next, I18nextProvider } from "react-i18next";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "../app/layout/Navbar";
import { PremiumModal } from "../app/components/PremiumModal";
import en from "../i18n/en.json";
import pt from "../i18n/pt.json";

const REQUIRED_KEYS = [
  "nav.nutritionPlan",
  "nav.groceryMission",
  "nav.mondayPrep",
  "nav.premium",
  "shoppingList.upgradeTitle",
  "shoppingList.upgradeSubtitle",
  "shoppingList.upgradeButton",
  "shoppingList.startMondayPrep",
  "shoppingList.shareButton",
  "shoppingList.shareTitle",
  "shoppingList.metricSwapsValue",
  "shoppingList.proteinImpact",
  "prepGuide.lockedTitle",
  "prepGuide.lockedSubtitle",
  "prepGuide.lockedProgress",
  "prepGuide.lockedBackButton",
  "prepGuide.upgradeTitle",
  "prepGuide.upgradeSubtitle",
  "prepGuide.upgradeButton",
  "prepGuide.taskStep",
  "prepGuide.taskParallel",
  "prepGuide.taskDurationMinutes",
  "premium.modal.title",
  "premium.modal.ctaFallback",
  "premium.modal.headline.unlimitedFoodRotation",
  "premium.modal.description.unlimitedFoodRotation",
  "premium.modal.benefits.unlimitedFoodRotation.1",
  "premium.modal.benefits.weeklyCoachAdjustments.1",
  "premium.modal.benefits.recipePacksPrepPdf.1",
  "planner.repeatLastWeek",
  "planner.premiumStackTitle",
  "planner.premiumStackButton",
  "planner.streakWeeks_one",
  "planner.streakWeeks_other",
  "shoppingList.categories.protein",
  "shoppingList.categories.fats",
  "shoppingList.categories.legumes",
  "shoppingList.categories.carbs",
  "shoppingList.categories.snacks",
  "shoppingList.categories.supplements"
] as const;

async function createTestI18n() {
  const i18n = createInstance();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        pt: { translation: pt }
      },
      lng: "en",
      fallbackLng: "en",
      interpolation: { escapeValue: false }
    });

  return i18n;
}

describe("Language consistency (PASSO 3)", () => {
  it("has all required translation keys in EN and PT", () => {
    for (const key of REQUIRED_KEYS) {
      expect(Object.prototype.hasOwnProperty.call(en, key)).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(pt, key)).toBe(true);
      expect(typeof (en as Record<string, unknown>)[key]).toBe("string");
      expect(typeof (pt as Record<string, unknown>)[key]).toBe("string");
    }
  });

  it("switches visible UI text between English and Portuguese", async () => {
    const i18n = await createTestI18n();

    const renderUI = () =>
      renderToStaticMarkup(
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <Navbar />
            <PremiumModal
              isOpen
              onClose={() => undefined}
              feature="unlimitedFoodRotation"
              remainingOptimizations={0}
            />
          </MemoryRouter>
        </I18nextProvider>
      );

    await i18n.changeLanguage("en");
    const enHtml = renderUI();

    expect(enHtml).toContain("Nutrition Plan");
    expect(enHtml).toContain("Grocery Mission");
    expect(enHtml).toContain("Monday Prep");
    expect(enHtml).toContain("Unlock your NutriPilot Pro Experience");
    expect(i18n.t("planner.repeatLastWeek")).toBe("Repeat Last Week");
    expect(i18n.t("planner.premiumStackTitle")).toBe("Premium performance stack");

    await i18n.changeLanguage("pt");
    const ptHtml = renderUI();

    expect(ptHtml).toContain("Plano Nutricional");
    expect(ptHtml).toContain("Missão de Compras");
    expect(ptHtml).toContain("Preparo de Segunda");
    expect(ptHtml).toContain("Desbloqueie sua experiência NutriPilot Pro");
    expect(i18n.t("planner.repeatLastWeek")).toBe("Repetir Semana Passada");
    expect(i18n.t("planner.premiumStackTitle")).toBe("Stack de performance Premium");

    expect(ptHtml).not.toContain("Nutrition Plan");
    expect(ptHtml).not.toContain("Grocery Mission");
    expect(ptHtml).not.toContain("Unlock your NutriPilot Pro Experience");
  });
});
