import { useNavigate } from "react-router-dom";
import { useShoppingPlan } from "../../contexts/ShoppingPlanContext";
import { Recipe } from "../../core/models/Recipe";
import "./RecipesPage.css";

export function RecipesPage() {
  const navigate = useNavigate();
  const { recipeSuggestions } = useShoppingPlan();

  if (recipeSuggestions.length === 0) {
    return (
      <div className="recipes-page">
        <div className="empty-state">
          <h2>🍳 Nenhuma sugestão disponível</h2>
          <p>Gere um plano primeiro para ver receitas!</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const mealTypeLabels = {
    breakfast: "☀️ Café da Manhã",
    lunch: "🍽️ Almoço",
    dinner: "🌙 Jantar",
    snack: "🍪 Lanche"
  };

  return (
    <div className="recipes-page">
      <header className="recipes-header">
        <button className="btn-back" onClick={() => navigate("/list")}>
          ← Voltar
        </button>
        <h1>🍳 Receitas Sugeridas</h1>
        <p>Baseadas nos ingredientes da sua lista</p>
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
          <span>{recipe.servings} porções</span>
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
        <h4>Ingredientes:</h4>
        <ul>
          {recipe.ingredients.slice(0, 5).map((ingredient, index) => (
            <li key={index}>
              {ingredient.name} - {ingredient.quantity} {ingredient.unit}
            </li>
          ))}
          {recipe.ingredients.length > 5 && (
            <li className="more-ingredients">
              +{recipe.ingredients.length - 5} ingredientes
            </li>
          )}
        </ul>
      </div>

      <div className="recipe-instructions">
        <h4>Como preparar:</h4>
        <ol>
          {recipe.instructions.slice(0, 3).map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
          {recipe.instructions.length > 3 && (
            <li className="more-steps">
              +{recipe.instructions.length - 3} passos
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
