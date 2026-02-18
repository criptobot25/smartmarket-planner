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
  "cottage cheese (low-fat)": "Cottage (baixo teor de gordura)",
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
  "lettuce (mixed greens)": "Alface (folhas mistas)",
  "lettuce (romaine)": "Alface romana",
  "cauliflower": "Couve-flor",
  "zucchini": "Abobrinha",
  "cucumber": "Pepino",
  "mushrooms": "Cogumelos",
  "mushrooms (button)": "Cogumelos (champignon)",
  "asparagus": "Aspargos",
  "green beans": "Vagem",
  "peas": "Ervilhas",
  "brussels sprouts": "Couve-de-bruxelas",
  "kale": "Couve",
  "bananas": "Bananas",
  "apples": "Maçãs",
  "blueberries": "Mirtilos",
  "berries (blueberries)": "Frutas vermelhas (mirtilos)",
  "strawberries": "Morangos",
  "oranges": "Laranjas",
  "pear": "Pera",
  "pears": "Peras",
  "grapes": "Uvas",
  "kiwi": "Kiwi",
  "pineapple": "Abacaxi",
  "watermelon": "Melancia",
  "mango": "Manga",
  "peach": "Pêssego",
  "avocado": "Abacate",
  "olive oil": "Azeite de oliva",
  "extra virgin olive oil": "Azeite de oliva extravirgem",
  "almonds": "Amêndoas",
  "almonds (raw)": "Amêndoas (cruas)",
  "peanut butter": "Pasta de amendoim",
  "peanut butter (natural)": "Pasta de amendoim (natural)",
  "cashews": "Castanhas de caju",
  "walnuts": "Nozes",
  "chia seeds": "Sementes de chia",
  "flaxseed": "Semente de linhaça",
  "flax seeds": "Sementes de linhaça",
  "butter (unsalted)": "Manteiga (sem sal)",
  "coconut oil": "Óleo de coco",
  "sunflower oil": "Óleo de girassol",
  "milk (whole)": "Leite integral",
  "milk (skim)": "Leite desnatado",
  "almond milk (unsweetened)": "Leite de amêndoas (sem açúcar)",
  "greek yogurt": "Iogurte grego",
  "eggs": "Ovos",
  "salmon": "Salmão",
  "cod": "Bacalhau",
  "ground beef": "Carne moída",
  "ground turkey": "Peru moído",
  "tilapia fillet": "Filé de tilápia",
  "tofu (firm)": "Tofu (firme)",
  "shrimp (raw)": "Camarão (cru)",
  "lamb chops": "Costeletas de cordeiro",
  "duck breast": "Peito de pato",
  "sardines (canned)": "Sardinha (enlatada)",
  "buckwheat": "Trigo-sarraceno",
  "rye bread": "Pão de centeio",
  "whole wheat tortillas": "Tortilhas integrais",
  "corn (frozen)": "Milho (congelado)",
  "eggplant": "Berinjela",
  "celery": "Salsão",
  "sweet potatoes": "Batata-doce",
  "sea salt": "Sal marinho",
  "black pepper": "Pimenta-do-reino",
  "garlic powder": "Alho em pó",
  "paprika": "Páprica",
  "protein bar (25g protein)": "Barra de proteína (25g de proteína)",
  "rice cakes": "Bolachas de arroz",
  "dark chocolate (85%)": "Chocolate amargo (85%)",
  "beef jerky": "Carne seca",
  "hummus": "Homus",
  "edamame (frozen)": "Edamame (congelado)",
  "trail mix": "Mix de castanhas",
  "popcorn (air-popped)": "Pipoca (sem óleo)",
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
    const regex = new RegExp(escapeRegExp(english), "gi");
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