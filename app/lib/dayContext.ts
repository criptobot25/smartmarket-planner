/**
 * Day-of-week context: returns motivational copy + emoji for daily ritual nudges.
 * Used in Today page, shopping list widget, and AppNav banner.
 */

export type DayContext = {
  dayKey: string;
  labelPt: string;
  bannerPt: string;
  bannerEn: string;
  emoji: string;
  isShoppingDay: boolean;
  isPrepDay: boolean;
};

const DAY_CONTEXTS: DayContext[] = [
  {
    dayKey: "sunday",
    labelPt: "Domingo",
    bannerPt: "Dia de preparar a semana! Separa as marmitas e garante a semana.",
    bannerEn: "Meal prep day! Batch cook and set your week up for success.",
    emoji: "🍳",
    isShoppingDay: false,
    isPrepDay: true,
  },
  {
    dayKey: "monday",
    labelPt: "Segunda-feira",
    bannerPt: "Semana nova, foco total. Começa bem e o resto segue.",
    bannerEn: "New week, new focus. Start strong and the rest follows.",
    emoji: "💪",
    isShoppingDay: true,
    isPrepDay: false,
  },
  {
    dayKey: "tuesday",
    labelPt: "Terça-feira",
    bannerPt: "Mantém o ritmo. Cada refeição conta.",
    bannerEn: "Keep the momentum. Every meal counts.",
    emoji: "🔥",
    isShoppingDay: false,
    isPrepDay: false,
  },
  {
    dayKey: "wednesday",
    labelPt: "Quarta-feira",
    bannerPt: "Meio da semana — já fizeste mais de metade. Continua.",
    bannerEn: "Midweek — you're already halfway there. Keep going.",
    emoji: "⚡",
    isShoppingDay: false,
    isPrepDay: false,
  },
  {
    dayKey: "thursday",
    labelPt: "Quinta-feira",
    bannerPt: "Quase lá. Não deixas cair agora.",
    bannerEn: "Almost there. Don't let it slip now.",
    emoji: "🎯",
    isShoppingDay: false,
    isPrepDay: false,
  },
  {
    dayKey: "friday",
    labelPt: "Sexta-feira",
    bannerPt: "Último sprint da semana. Fecha bem.",
    bannerEn: "Last sprint of the week. Finish strong.",
    emoji: "🏁",
    isShoppingDay: false,
    isPrepDay: false,
  },
  {
    dayKey: "saturday",
    labelPt: "Sábado",
    bannerPt: "Semana quase completa! Amanhã é dia de preparar a próxima.",
    bannerEn: "Week almost done! Tomorrow is prep day.",
    emoji: "🎉",
    isShoppingDay: false,
    isPrepDay: false,
  },
];

export function getTodayContext(): DayContext {
  const idx = new Date().getDay(); // 0=sun, 1=mon, ...
  return DAY_CONTEXTS[idx];
}

export function getCurrentMealSlot(): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = new Date().getHours();
  if (hour < 10) return "breakfast";
  if (hour < 14) return "lunch";
  if (hour < 20) return "dinner";
  return "snack";
}

export function getMealLabelPt(slot: string): string {
  const labels: Record<string, string> = {
    breakfast: "Pequeno-almoço",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Snack",
  };
  return labels[slot] ?? slot;
}

export function getMealEmoji(slot: string): string {
  const emojis: Record<string, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍎",
  };
  return emojis[slot] ?? "🍽️";
}
