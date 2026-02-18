const PT_FOOD_NAME_MAP: Record<string, string> = {
  "chicken breast (skinless)": "Peito de frango (sem pele)",
  "eggs (large)": "Ovos (grandes)",
  "greek yogurt (0% fat)": "Iogurte grego (0% gordura)",
  "salmon fillet": "Filé de salmão",
  "tuna (canned)": "Atum (enlatado)",
  "lean ground beef (5% fat)": "Carne moída magra (5% gordura)",
  "turkey breast": "Peito de peru",
  "cod fillet": "Filé de bacalhau",
  "pork loin": "Lombo suíno",
  "cottage cheese (low fat)": "Cottage (baixo teor de gordura)",
  "white rice": "Arroz branco",
  "brown rice": "Arroz integral",
  "oats (rolled)": "Aveia em flocos",
  "sweet potato": "Batata-doce",
  "whole wheat bread": "Pão integral",
  "quinoa": "Quinoa",
  "pasta (whole wheat)": "Macarrão integral",
  "couscous": "Cuscuz",
  "barley": "Cevada",
  "white bread": "Pão branco",
  "broccoli": "Brócolis",
  "spinach (fresh)": "Espinafre (fresco)",
  "tomatoes": "Tomates",
  "carrots": "Cenouras",
  "onions": "Cebolas",
  "bell peppers": "Pimentões",
  "lettuce": "Alface",
  "cauliflower": "Couve-flor",
  "zucchini": "Abobrinha",
  "cucumber": "Pepino",
  "mushrooms": "Cogumelos",
  "asparagus": "Aspargos",
  "green beans": "Vagem",
  "peas": "Ervilhas",
  "kale": "Couve",
  "bananas": "Bananas",
  "apples": "Maçãs",
  "berries (blueberries)": "Frutas vermelhas (mirtilos)",
  "oranges": "Laranjas",
  "pears": "Peras",
  "grapes": "Uvas",
  "kiwi": "Kiwi",
  "pineapple": "Abacaxi",
  "mango": "Manga",
  "avocado": "Abacate",
  "olive oil": "Azeite de oliva",
  "almonds": "Amêndoas",
  "peanut butter": "Pasta de amendoim",
  "walnuts": "Nozes",
  "chia seeds": "Sementes de chia",
  "flax seeds": "Sementes de linhaça",
  "butter (unsalted)": "Manteiga (sem sal)",
  "sunflower oil": "Óleo de girassol",
  "milk (whole)": "Leite integral",
  "greek yogurt": "Iogurte grego",
  "eggs": "Ovos",
  "salmon": "Salmão",
  "cod": "Bacalhau",
  "ground beef": "Carne moída",
  "ground turkey": "Peru moído",
  "sweet potatoes": "Batata-doce",
  "ready-to-eat items": "Itens prontos para consumo",
  "all cooked foods": "Todos os alimentos cozidos"
};

const COVERAGE_LABEL_PT: Record<string, string> = {
  protein: "proteína",
  carbs: "carboidratos",
  vegetables: "vegetais",
  fruit: "frutas",
  dairy: "laticínios",
  "healthy fats": "gorduras saudáveis",
  legumes: "leguminosas",
  "your meals": "suas refeições"
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function localizeFoodName(name: string, language: string): string {
  if (!language.startsWith("pt")) {
    return name;
  }

  const mapped = PT_FOOD_NAME_MAP[name.trim().toLowerCase()];
  return mapped || name;
}

export function localizeFoodText(text: string, language: string): string {
  if (!text || !language.startsWith("pt")) {
    return text;
  }

  let localized = text;
  const entries = Object.entries(PT_FOOD_NAME_MAP).sort((a, b) => b[0].length - a[0].length);

  entries.forEach(([english, portuguese]) => {
    const regex = new RegExp(`\\b${escapeRegExp(english)}\\b`, "gi");
    localized = localized.replace(regex, portuguese);
  });

  return localized;
}

export function localizeCoverageText(text: string, language: string): string {
  if (!text || !language.startsWith("pt")) {
    return text;
  }

  const coveragePattern = /This covers\s+(\d+)\s+day(s)?\s+of\s+(.+)/i;
  const match = text.match(coveragePattern);

  if (match) {
    const days = Number.parseInt(match[1], 10);
    const dayLabel = days === 1 ? "dia" : "dias";
    const originalCoverageLabel = match[3].trim().toLowerCase();
    const coverageLabel = COVERAGE_LABEL_PT[originalCoverageLabel] || originalCoverageLabel;
    return `Cobre ${days} ${dayLabel} de ${coverageLabel}`;
  }

  return text;
}

export function localizeReasonText(text: string, language: string): string {
  if (!text || !language.startsWith("pt")) {
    return text;
  }

  return text
    .replace(/Breakfast/gi, "Café da manhã")
    .replace(/Lunch/gi, "Almoço")
    .replace(/Dinner/gi, "Jantar")
    .replace(/Snack/gi, "Lanche")
    .replace(/daily/gi, "diariamente")
    .replace(/for\s+(\d+)\s+meal(s)?/gi, "para $1 refeições")
    .replace(/cooking/gi, "preparo");
}