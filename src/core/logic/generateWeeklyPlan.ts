import { PlanInput } from "../models/PlanInput";
import { WeeklyPlan, DayOfWeek, DayPlan, DayMeals, Meal } from "../models/WeeklyPlan";
import { mockFoods } from "../../data/mockFoods";

/**
 * FITNESS-FIRST WEEKLY PLAN GENERATOR
 * 
 * Gera plano semanal REALISTA baseado em meal prep fitness:
 * - Padrões fixos de refeições (2 cafés, 2 almoços, 2 jantares)
 * - Alta repetição (meal prep real)
 * - Foco em proteína alvo
 * - Ajustado por fitness goal (cutting/maintenance/bulking)
 * 
 * NÃO usa sorteio aleatório.
 * NÃO gera 21 refeições diferentes.
 * NÃO depende de Recipe (Clean Architecture).
 * 
 * Fonte: Meal prep behavior patterns (NCBI PMC7071223)
 */

/**
 * Estrutura de uma refeição simples (não é Recipe)
 */
interface MealTemplate {
  name: string;
  foodIds: string[];  // IDs dos alimentos do mockFoods
  protein: number;    // grams
}

/**
 * Calcula proteína alvo baseado no fitness goal
 * Defaults simples sem assumir peso corporal
 */
function calculateProteinTarget(input: PlanInput): number {
  // Se já foi especificado, usa o valor
  if (input.proteinTargetPerDay && input.proteinTargetPerDay > 0) {
    return input.proteinTargetPerDay;
  }

  // Defaults baseados em metas fitness típicas
  const defaultProteinTargets = {
    cutting: 150,      // Alta proteína para preservar massa magra
    maintenance: 120,  // Proteína moderada
    bulking: 140       // Proteína moderada-alta + surplus calórico
  };
  
  const goal = input.fitnessGoal || "maintenance";
  return defaultProteinTargets[goal];
}

/**
 * Define os meal templates fixos baseados no fitness goal
 * CORREÇÃO 4: Snack obrigatório em bulking
 * 
 * @param goal Fitness goal
 * @param excludedFoods List of food names to exclude (e.g., ["tuna", "salmon"])
 */
function getMealTemplates(
  goal: "cutting" | "maintenance" | "bulking",
  excludedFoods: string[] = []
): {
  breakfasts: MealTemplate[];
  lunches: MealTemplate[];
  dinners: MealTemplate[];
  snacks: MealTemplate[];  // Adicionado
} {
  // BREAKFAST TEMPLATES (2 opções fixas)
  const breakfasts: MealTemplate[] = [
    {
      name: "Oats + Greek Yogurt + Berries",
      foodIds: ["food-010", "food-003", "food-024"],  // Oats, Greek yogurt, Blueberries
      protein: 35
    },
    {
      name: "Eggs + Whole Wheat Bread + Banana",
      foodIds: ["food-002", "food-012", "food-022"],  // Eggs, Bread, Banana
      protein: 28
    }
  ];

  // LUNCH TEMPLATES (2 opções fixas, variam por goal)
  let lunches: MealTemplate[];
  
  if (goal === "cutting") {
    lunches = [
      {
        name: "Chicken Breast + Broccoli + Sweet Potato",
        foodIds: ["food-001", "food-015", "food-011"],  // Chicken, Broccoli, Sweet potato
        protein: 45
      },
      {
        name: "Salmon + Spinach + Quinoa",
        foodIds: ["food-004", "food-016", "food-013"],  // Salmon, Spinach, Quinoa
        protein: 42
      }
    ];
  } else if (goal === "bulking") {
    lunches = [
      {
        name: "Chicken Breast + White Rice + Broccoli",
        foodIds: ["food-001", "food-008", "food-015"],  // Chicken, Rice, Broccoli
        protein: 45
      },
      {
        name: "Ground Beef + Pasta + Bell Peppers",
        foodIds: ["food-006", "food-014", "food-018"],  // Beef, Pasta, Peppers
        protein: 48
      }
    ];
  } else {
    // Maintenance
    lunches = [
      {
        name: "Chicken Breast + Brown Rice + Mixed Vegetables",
        foodIds: ["food-001", "food-009", "food-015", "food-017"],  // Chicken, Brown rice, Broccoli, Tomatoes
        protein: 42
      },
      {
        name: "Tuna + Quinoa + Salad",
        foodIds: ["food-005", "food-013", "food-021"],  // Tuna, Quinoa, Lettuce
        protein: 38
      }
    ];
  }

  // DINNER TEMPLATES (2 opções fixas, similar ao lunch)
  let dinners: MealTemplate[];
  
  if (goal === "cutting") {
    dinners = [
      {
        name: "Chicken Breast + Broccoli + Sweet Potato",
        foodIds: ["food-001", "food-015", "food-011"],  // Repetição intencional (meal prep)
        protein: 45
      },
      {
        name: "Salmon + Asparagus + Brown Rice",
        foodIds: ["food-004", "food-016", "food-009"],  // Salmon, Spinach (proxy), Brown rice
        protein: 40
      }
    ];
  } else if (goal === "bulking") {
    dinners = [
      {
        name: "Chicken + White Rice + Vegetables",
        foodIds: ["food-001", "food-008", "food-015"],
        protein: 45
      },
      {
        name: "Ground Beef + Sweet Potato + Salad",
        foodIds: ["food-006", "food-011", "food-021"],
        protein: 42
      }
    ];
  } else {
    dinners = [
      {
        name: "Chicken + Brown Rice + Vegetables",
        foodIds: ["food-001", "food-009", "food-015"],
        protein: 42
      },
      {
        name: "Salmon + Sweet Potato + Spinach",
        foodIds: ["food-004", "food-011", "food-016"],
        protein: 38
      }
    ];
  }

  // SNACKS (obrigatório em bulking para surplus calórico)
  const snacks: MealTemplate[] = goal === "bulking" 
    ? [
        {
          name: "Greek Yogurt + Oats + Banana",
          foodIds: ["food-003", "food-010", "food-022"],  // Greek yogurt, Oats, Banana
          protein: 20
        }
      ]
    : [];

  // Filter out meals containing excluded foods
  const filterMealsByExclusions = (meals: MealTemplate[]): MealTemplate[] => {
    if (excludedFoods.length === 0) return meals;
    
    return meals.filter(meal => {
      // Get food names from foodIds
      const foodNames = meal.foodIds
        .map(id => mockFoods.find(f => f.id === id)?.name)
        .filter((name): name is string => name !== undefined);
      
      // Check if any excluded food is in this meal
      const hasExcludedFood = foodNames.some(name => excludedFoods.includes(name));
      
      return !hasExcludedFood;
    });
  };

  const filteredBreakfasts = filterMealsByExclusions(breakfasts);
  const filteredLunches = filterMealsByExclusions(lunches);
  const filteredDinners = filterMealsByExclusions(dinners);
  const filteredSnacks = filterMealsByExclusions(snacks);

  return { 
    breakfasts: filteredBreakfasts.length > 0 ? filteredBreakfasts : breakfasts,
    lunches: filteredLunches.length > 0 ? filteredLunches : lunches,
    dinners: filteredDinners.length > 0 ? filteredDinners : dinners,
    snacks: filteredSnacks.length > 0 ? filteredSnacks : snacks
  };
}

/**
 * Gera um plano semanal FITNESS-AWARE
 */
export function generateWeeklyPlan(input: PlanInput): WeeklyPlan {
  const daysOfWeek: DayOfWeek[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ];

  const goal = input.fitnessGoal || "maintenance";
  const proteinTarget = calculateProteinTarget(input);
  const templates = getMealTemplates(goal, input.excludedFoods || []);

  // Padrão de repetição semanal (meal prep real)
  // Segunda: Breakfast A, Lunch A, Dinner A
  // Terça: Breakfast B, Lunch A, Dinner A
  // Quarta: Breakfast A, Lunch B, Dinner B
  // Quinta: Breakfast B, Lunch B, Dinner B
  // Sexta: Breakfast A, Lunch A, Dinner A
  // Sábado: Breakfast B, Lunch B, Dinner B
  // Domingo: Breakfast A, Lunch A, Dinner A (meal prep do próximo)

  const mealPattern = [
    { breakfast: 0, lunch: 0, dinner: 0 },  // Mon
    { breakfast: 1, lunch: 0, dinner: 0 },  // Tue
    { breakfast: 0, lunch: 1, dinner: 1 },  // Wed
    { breakfast: 1, lunch: 1, dinner: 1 },  // Thu
    { breakfast: 0, lunch: 0, dinner: 0 },  // Fri
    { breakfast: 1, lunch: 1, dinner: 1 },  // Sat
    { breakfast: 0, lunch: 0, dinner: 0 }   // Sun
  ];

  const days: DayPlan[] = daysOfWeek.map((day, index) => {
    const pattern = mealPattern[index];
    
    // Converte templates para Meal (não Recipe)
    const breakfast = convertToMeal(templates.breakfasts[pattern.breakfast]);
    const lunch = convertToMeal(templates.lunches[pattern.lunch]);
    const dinner = convertToMeal(templates.dinners[pattern.dinner]);
    const snack = goal === "bulking" ? convertToMeal(templates.snacks[0]) : null;

    const meals: DayMeals = {
      breakfast,
      lunch,
      dinner,
      snack
    };

    return { day, meals };
  });

  const weeklyPlan: WeeklyPlan = {
    id: generatePlanId(),
    createdAt: new Date(),
    planInput: input,
    days,
    shoppingList: [],
    totalCost: 0,
    budgetAdjustedCost: 0, // Will be set by generateShoppingList
    proteinPerDay: proteinTarget
  };

  return weeklyPlan;
}

/**
 * Converte MealTemplate para Meal (Clean Architecture)
 * NÃO depende de Recipe
 */
function convertToMeal(template: MealTemplate): Meal {
  return {
    id: `meal-${template.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: template.name,
    foodIds: template.foodIds,
    protein: template.protein
  };
}

/**
 * Gera ID único para o plano
 */
function generatePlanId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `plan-${timestamp}-${random}`;
}
