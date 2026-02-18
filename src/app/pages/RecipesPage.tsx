import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { Recipe } from "../../core/models/Recipe";
import "./RecipesPage.css";

export function RecipesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { recipeSuggestions } = useShoppingPlan();

  if (recipeSuggestions.length === 0) {
    return (
      <div className="recipes-page">
        <div className="empty-state">
          <h2>🍳 {t("recipes.emptyTitle")}</h2>
          <p>{t("recipes.emptySubtitle")}</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            {t("recipes.emptyButton")}
          </button>
        </div>
      </div>
    );
  }

  const mealTypeLabels = {
    breakfast: `☀️ ${t("recipes.mealType.breakfast")}`,
    lunch: `🍽️ ${t("recipes.mealType.lunch")}`,
    dinner: `🌙 ${t("recipes.mealType.dinner")}`,
    snack: `🍪 ${t("recipes.mealType.snack")}`
  };

  return (
    <div className="recipes-page">
      <header className="recipes-header">
        <button className="btn-back" onClick={() => navigate("/list")}>
          ← {t("recipes.back")}
        </button>
        <h1>🍳 {t("recipes.title")}</h1>
        <p>{t("recipes.subtitle")}</p>
      </header>

      <main className="recipes-main">
        <div className="recipes-grid">
          {recipeSuggestions.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} mealTypeLabels={mealTypeLabels} />
          ))}
        </div>
      </main>
    </div>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  mealTypeLabels: Record<string, string>;
}

function RecipeCard({ recipe, mealTypeLabels }: RecipeCardProps) {
  const { t } = useTranslation();

  return (
    <div className="recipe-card">
      <div className="recipe-card-header">
        <h3 className="recipe-title">{recipe.name}</h3>
        <span className="recipe-meal-type">
          {mealTypeLabels[recipe.mealType]}
        </span>
      </div>

      <div className="recipe-meta">
        <div className="recipe-info">
          <span className="recipe-icon">⏱️</span>
          <span>{recipe.prepTime} min</span>
        </div>
        <div className="recipe-info">
          <span className="recipe-icon">👥</span>
          <span>{t("recipes.servings", { count: recipe.servings })}</span>
        </div>
      </div>

      <div className="recipe-tags">
        {recipe.tags.map((tag, index) => (
          <span key={index} className="recipe-tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="recipe-ingredients">
        <h4>{t("recipes.ingredientsTitle")}</h4>
        <ul>
          {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
            <li key={index}>
              {ingredient.name} - {ingredient.quantity} {ingredient.unit}
            </li>
          ))}
          {recipe.ingredients.length > 5 && (
            <li className="more-ingredients">
              {t("recipes.moreIngredients", { count: recipe.ingredients.length - 5 })}
            </li>
          )}
        </ul>
      </div>

      <div className="recipe-instructions">
        <h4>{t("recipes.instructionsTitle")}</h4>
        <ol>
          {recipe.instructions.slice(0, 3).map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
          {recipe.instructions.length > 3 && (
            <li className="more-steps">
              {t("recipes.moreSteps", { count: recipe.instructions.length - 3 })}
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
