import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { PlanInput } from "../core/models/PlanInput";
import { WeeklyPlan } from "../core/models/WeeklyPlan";
import { FoodItem } from "../core/models/FoodItem";
import { Recipe } from "../core/models/Recipe";
import { generateWeeklyPlan, generateSingleMeal } from "../core/logic/generateWeeklyPlan";
import { generateShoppingList } from "../core/logic/generateShoppingList";
import { suggestRecipes } from "../core/logic/suggestRecipes";
import { savePlan } from "../core/storage/savePlan";
import { loadHistory as loadHistoryFromStorage, loadLatestPlan } from "../core/storage/loadHistory";
import { clearHistory as clearHistoryFromStorage } from "../core/storage/clearHistory";
import { userPreferencesStore } from "../core/stores/UserPreferencesStore";
import { isPlanValidForInput } from "../core/utils/planFingerprint";
import { detectRepetitionRisk, getLatestWeeklyFeedback, getMostRepeatedFoods } from "../hooks/useWeeklyFeedback";
import { canUseWeeklyCoachAdjustments } from "../core/premium/PremiumFeatures";
import { isFeatureEnabled } from "../core/config/featureFlags";
import { validateShoppingList } from "../core/logic/validateShoppingList";
import {
  LEGACY_PERSISTENCE_KEYS,
  PERSISTENCE_KEYS,
  clearPurchasedItemsState,
  loadAdherenceScoreState,
  loadAdherenceSmoothingState as loadAdherenceSmoothingStateFromPersistence,
  loadLastWeeklyPlanState,
  loadPurchasedItemsState,
  loadStreakDataState,
  logStateRecoveryEvent,
  saveAdherenceScoreState,
  saveAdherenceSmoothingState as saveAdherenceSmoothingStateToPersistence,
  saveLastWeeklyPlanState,
  savePurchasedItemsState,
  saveStreakDataState,
} from "./shoppingPlanPersistence";

const ADHERENCE_EWMA_ALPHA = 0.35;
const LOW_ADHERENCE_THRESHOLD = 65;
const HIGH_ADHERENCE_THRESHOLD = 85;

interface AdherenceSmoothingState {
  smoothedScore: number;
  lowStreak: number;
  highStreak: number;
  timestamp: string;
}

/**
 * LocalStorage helpers for purchased items
 */
function savePurchasedItems(itemIds: string[]): void {
  try {
    savePurchasedItemsState(itemIds);
  } catch (error) {
    console.error("❌ Error saving purchased items to localStorage:", error);
  }
}

function loadPurchasedItems(): Set<string> {
  try {
    return loadPurchasedItemsState();
  } catch (error) {
    console.error("❌ Error loading purchased items from localStorage:", error);
  }
  return new Set();
}

function clearPurchasedItems(): void {
  try {
    clearPurchasedItemsState();
  } catch (error) {
    console.error("❌ Error clearing purchased items from localStorage:", error);
  }
}

/**
 * PASSO 33.1: LocalStorage helpers for last weekly plan (Repeat Last Week)
 */
function saveLastWeeklyPlan(plan: WeeklyPlan, input: PlanInput): void {
  try {
    saveLastWeeklyPlanState(plan, input);
    console.log("💾 Last weekly plan saved for Repeat feature");
  } catch (error) {
    console.error("❌ Error saving last weekly plan to localStorage:", error);
  }
}

function loadLastWeeklyPlan(): { plan: WeeklyPlan; input: PlanInput } | null {
  try {
    const loaded = loadLastWeeklyPlanState();
    if (loaded) {
      console.log("✅ Last weekly plan loaded from localStorage");
    }
    return loaded;
  } catch (error) {
    console.error("❌ Error loading last weekly plan from localStorage:", error);
  }
  return null;
}

/**
 * PASSO 33.2: LocalStorage helpers for adherence score (Weekly Check-In)
 */
function saveAdherenceScoreToStorage(score: { score: number; timestamp: string; level: "high" | "good" | "low" }): void {
  try {
    saveAdherenceScoreState(score);
    console.log("💾 Adherence score saved:", score.level, `(${score.score}%)`);
  } catch (error) {
    console.error("❌ Error saving adherence score to localStorage:", error);
  }
}

function loadAdherenceScoreFromStorage(): { score: number; timestamp: string; level: "high" | "good" | "low" } | null {
  try {
    const loaded = loadAdherenceScoreState();
    if (loaded) {
      console.log("✅ Adherence score loaded:", loaded.level, `(${loaded.score}%)`);
    }
    return loaded;
  } catch (error) {
    console.error("❌ Error loading adherence score from localStorage:", error);
  }
  return null;
}

function saveAdherenceSmoothingState(state: AdherenceSmoothingState): void {
  try {
    saveAdherenceSmoothingStateToPersistence(state);
  } catch (error) {
    console.error("❌ Error saving adherence smoothing state:", error);
  }
}

function loadAdherenceSmoothingState(): AdherenceSmoothingState | null {
  try {
    return loadAdherenceSmoothingStateFromPersistence();
  } catch (error) {
    console.error("❌ Error loading adherence smoothing state:", error);
  }

  return null;
}

function updateAdherenceSmoothingState(adherence: { score: number; timestamp: string; level: "high" | "good" | "low" }): AdherenceSmoothingState {
  const previous = loadAdherenceSmoothingState();
  const smoothedScore = previous
    ? Math.round((ADHERENCE_EWMA_ALPHA * adherence.score + (1 - ADHERENCE_EWMA_ALPHA) * previous.smoothedScore) * 100) / 100
    : adherence.score;

  const lowStreak = smoothedScore <= LOW_ADHERENCE_THRESHOLD
    ? (previous?.lowStreak ?? 0) + 1
    : 0;

  const highStreak = smoothedScore >= HIGH_ADHERENCE_THRESHOLD
    ? (previous?.highStreak ?? 0) + 1
    : 0;

  const nextState: AdherenceSmoothingState = {
    smoothedScore,
    lowStreak,
    highStreak,
    timestamp: adherence.timestamp,
  };

  saveAdherenceSmoothingState(nextState);
  return nextState;
}

/**
 * PASSO 33.2: Apply adaptive adjustments based on adherence score
 */
function applyAdaptiveAdjustments(
  input: PlanInput, 
  adherence: { score: number; timestamp: string; level: "high" | "good" | "low" } | null,
  recentPlans: WeeklyPlan[]
): PlanInput {
  const latestFeedback = getLatestWeeklyFeedback();
  const smoothingState = adherence ? updateAdherenceSmoothingState(adherence) : loadAdherenceSmoothingState();
  const adjustedInput: PlanInput = {
    ...input,
    excludedFoods: [...(input.excludedFoods || [])]
  };

  const lowAdherence =
    latestFeedback?.response === "no" ||
    ((smoothingState?.lowStreak ?? 0) >= 2);

  if (lowAdherence) {
    console.log("⚠️ Low adherence detected - applying simplification adjustments");
    adjustedInput.costTier = "low";
    adjustedInput.mealsPerDay = Math.max(3, input.mealsPerDay - 1);
    adjustedInput.dietStyle = "balanced";
    adjustedInput.fitnessGoal = "maintenance";
  }

  const repetitionRisk = detectRepetitionRisk(recentPlans) || latestFeedback?.repeatedTooMuch === true;
  if (repetitionRisk) {
    const repeatedFoods = getMostRepeatedFoods(recentPlans, 2);
    adjustedInput.excludedFoods = [...new Set([...(adjustedInput.excludedFoods || []), ...repeatedFoods])];
    if (adjustedInput.costTier === "low") {
      adjustedInput.costTier = "medium";
    }
    console.log("🔄 Repetition detected - increasing variety by avoiding repeated foods:", repeatedFoods);
  }

  const isBulkingGoal = adjustedInput.fitnessGoal === "bulking" || adjustedInput.dietStyle === "comfort";
  if (isBulkingGoal) {
    adjustedInput.fitnessGoal = "bulking";
    const baseProteinTarget = adjustedInput.proteinTargetPerDay || Math.round(adjustedInput.weightKg * 2);
    adjustedInput.proteinTargetPerDay = Math.round(baseProteinTarget * 1.1);
    console.log("💪 Bulking goal detected - increasing protein target by 10% for next week");
  }

  return adjustedInput;
}

/**
 * PASSO 33.4: Streak tracking - LocalStorage helpers
 */
interface StreakData {
  currentStreak: number;
  lastGenerationDate: string; // ISO date string (YYYY-MM-DD)
  longestStreak: number;
  totalGenerations: number;
}

function saveStreakData(data: StreakData): void {
  try {
    saveStreakDataState(data);
    console.log("🔥 Streak data saved:", data.currentStreak, "weeks");
  } catch (error) {
    console.error("❌ Error saving streak data to localStorage:", error);
  }
}

function loadStreakData(): StreakData {
  try {
    const loaded = loadStreakDataState();
    console.log("✅ Streak data loaded:", loaded.currentStreak, "weeks");
    return loaded;
  } catch (error) {
    console.error("❌ Error loading streak data from localStorage:", error);
  }
  // Default streak data
  return {
    currentStreak: 0,
    lastGenerationDate: "",
    longestStreak: 0,
    totalGenerations: 0
  };
}

/**
 * PASSO 33.4: Calculate if two dates are in consecutive weeks
 */
function areConsecutiveWeeks(date1: string, date2: string): boolean {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Get week number and year for each date
  const getWeekInfo = (date: Date) => {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    return { year: date.getFullYear(), week: weekNumber };
  };
  
  const week1 = getWeekInfo(d1);
  const week2 = getWeekInfo(d2);
  
  // Check if weeks are consecutive
  if (week1.year === week2.year) {
    return Math.abs(week1.week - week2.week) === 1;
  }
  
  // Handle year transition (e.g., week 52 of 2024 → week 1 of 2025)
  if (week2.year === week1.year + 1) {
    return week1.week >= 52 && week2.week === 1;
  }
  
  return false;
}

/**
 * PASSO 33.4: Check if date is in same week as today
 */
function isSameWeek(dateString: string): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  
  const getWeekInfo = (d: Date) => {
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    return { year: d.getFullYear(), week: weekNumber };
  };
  
  const week1 = getWeekInfo(date);
  const week2 = getWeekInfo(today);
  
  return week1.year === week2.year && week1.week === week2.week;
}

/**
 * PASSO 33.4: Update streak when user generates a plan
 */
function updateStreak(): StreakData {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const streakData = loadStreakData();
  
  // If already generated today/this week, don't update streak
  if (isSameWeek(streakData.lastGenerationDate)) {
    console.log("ℹ️ Plan already generated this week - streak unchanged");
    return streakData;
  }
  
  // Check if this is consecutive with last generation
  if (areConsecutiveWeeks(streakData.lastGenerationDate, today)) {
    // Continue streak
    streakData.currentStreak += 1;
    console.log("🔥 Streak continued:", streakData.currentStreak, "weeks!");
  } else if (streakData.lastGenerationDate === "") {
    // First ever generation
    streakData.currentStreak = 1;
    console.log("🎉 Streak started: 1 week!");
  } else {
    // Streak broken - reset
    console.log("💔 Streak broken - starting over");
    streakData.currentStreak = 1;
  }
  
  // Update stats
  streakData.lastGenerationDate = today;
  streakData.totalGenerations += 1;
  streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
  
  saveStreakData(streakData);
  
  return streakData;
}

interface ShoppingPlanContextData {
  // Estado
  currentInput: PlanInput | null;
  weeklyPlan: WeeklyPlan | null;
  shoppingList: FoodItem[];
  recipeSuggestions: Recipe[];
  history: WeeklyPlan[];
  streak: number; // PASSO 33.4
  
  // Funções
  generatePlan: (input: PlanInput) => void;
  repeatLastWeek: () => boolean; // PASSO 33.1: Returns true if successful
  saveAdherenceScore: (score: { score: number; timestamp: string; level: "high" | "good" | "low" }) => void; // PASSO 33.2
  getLastAdherenceScore: () => { score: number; timestamp: string; level: "high" | "good" | "low" } | null; // PASSO 33.2
  getStreakData: () => StreakData; // PASSO 33.4
  swapMeal: (dayIndex: number, mealType: "breakfast" | "lunch" | "dinner" | "snack") => void;
  toggleItemPurchased: (id: string) => void;
  loadHistory: () => void;
  clearHistory: () => void;
  resetPlan: () => void;
}

const ShoppingPlanContext = createContext<ShoppingPlanContextData | undefined>(undefined);

interface ShoppingPlanProviderProps {
  children: ReactNode;
}

export function ShoppingPlanProvider({ children }: ShoppingPlanProviderProps) {
  const [currentInput, setCurrentInput] = useState<PlanInput | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<FoodItem[]>([]);
  const [recipeSuggestions, setRecipeSuggestions] = useState<Recipe[]>([]);
  const [history, setHistory] = useState<WeeklyPlan[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [streak, setStreak] = useState<number>(0); // PASSO 33.4

  // PASSO 33.4: Load streak on mount
  useEffect(() => {
    const streakData = loadStreakData();
    setStreak(streakData.currentStreak);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const purchasedKeys = new Set<string>([PERSISTENCE_KEYS.purchasedItems, ...LEGACY_PERSISTENCE_KEYS.purchasedItems]);
    const streakKeys = new Set<string>([PERSISTENCE_KEYS.streakData, ...LEGACY_PERSISTENCE_KEYS.streakData]);

    const onStorageUpdate = (event: StorageEvent) => {
      if (!event.key) {
        return;
      }

      if (purchasedKeys.has(event.key)) {
        const purchasedIds = loadPurchasedItems();
        setShoppingList((previousList) => previousList.map((item) => ({
          ...item,
          purchased: purchasedIds.has(item.id),
        })) as FoodItem[]);
        logStateRecoveryEvent("cross_tab_sync_applied", { key: event.key, target: "shoppingList" });
      }

      if (streakKeys.has(event.key)) {
        const syncedStreakData = loadStreakData();
        setStreak(syncedStreakData.currentStreak);
        logStateRecoveryEvent("cross_tab_sync_applied", { key: event.key, target: "streak" });
      }
    };

    window.addEventListener("storage", onStorageUpdate);

    return () => {
      window.removeEventListener("storage", onStorageUpdate);
    };
  }, []);

  /**
   * Carrega o último plano salvo ao iniciar o app (executa apenas uma vez)
   * PASSO 31: Validates plan fingerprint to ensure personalization
   */
  useEffect(() => {
    if (!isInitialized) {
      console.log("🔄 Inicializando app - carregando dados do LocalStorage...");
      
      try {
        // Carrega histórico
        const loadedHistory = loadHistoryFromStorage();
        setHistory(loadedHistory);
        console.log("📚 Histórico carregado:", loadedHistory.length, "planos");

        // Carrega o último plano salvo
        const latestPlan = loadLatestPlan();
        
        if (latestPlan) {
          console.log("📥 Último plano encontrado:", latestPlan.id);
          
          // PASSO 31: Validate plan fingerprint before loading
          // If plan was generated with different inputs, don't load it
          // This prevents showing stale plans when user changes parameters
          const isValid = isPlanValidForInput(latestPlan.planHash, latestPlan.planInput);
          
          if (!isValid) {
            console.log("⚠️ Plano salvo tem inputs diferentes - ignorando para evitar confusão");
            console.log("ℹ️ User will need to generate a new plan with their current preferences");
            setIsInitialized(true);
            return;
          }
          
          // Load purchased items from localStorage
          const purchasedIds = loadPurchasedItems();
          
          // Mark items as purchased based on stored IDs
          const listWithPurchasedState = latestPlan.shoppingList.map(item => ({
            ...item,
            purchased: purchasedIds.has(item.id)
          })) as FoodItem[];
          
          setWeeklyPlan(latestPlan);
          setCurrentInput(latestPlan.planInput);
          setShoppingList(listWithPurchasedState);
          
          // Gera sugestões baseadas na lista salva
          const suggestions = suggestRecipes(latestPlan.shoppingList);
          setRecipeSuggestions(suggestions);
          
          console.log("✅ Estado restaurado do LocalStorage");
        } else {
          console.log("ℹ️ Nenhum plano salvo encontrado - novo usuário");
        }
      } catch (error) {
        console.error("❌ Erro ao carregar dados iniciais:", error);
      } finally {
        setIsInitialized(true);
      }
    }
  }, [isInitialized]);

  /**
   * Gera um plano completo baseado no input do usuário
   * Cria plano semanal, lista de compras, sugestões e salva no histórico
   * 
   * PASSO 33.2: Applies adaptive adjustments based on last week's adherence
   */
  const generatePlan = useCallback((input: PlanInput) => {
    try {
      console.log("🚀 Gerando plano com input:", input);

      // Clear purchased items when generating a new plan
      clearPurchasedItems();

      // PASSO 33.2: Load last adherence score and apply adaptive adjustments
      const lastAdherence = loadAdherenceScoreFromStorage();
      const recentPlans = loadHistoryFromStorage().slice(0, 2);
      const weeklyCoachEnabled = isFeatureEnabled("weeklyCoachAdjustmentsPremiumOnly")
        ? canUseWeeklyCoachAdjustments()
        : true;

      const adjustedInput = weeklyCoachEnabled
        ? applyAdaptiveAdjustments(input, lastAdherence, recentPlans)
        : { ...input };

      if (!weeklyCoachEnabled) {
        console.log("🔒 Weekly Coach Adjustments are Premium-only");
      }
      
      if (lastAdherence?.level === "low") {
        console.log("🎯 Adaptive adjustments applied for easier adherence");
      }

      // PASSO 26: Track excluded foods as disliked preferences
      if (adjustedInput.excludedFoods && adjustedInput.excludedFoods.length > 0) {
        adjustedInput.excludedFoods.forEach(foodName => {
          userPreferencesStore.addDislikedFood(foodName);
        });
        console.log("👎 Alimentos excluídos salvos como disliked:", adjustedInput.excludedFoods);
      }

      // Salva o input atual (com ajustes aplicados)
      setCurrentInput(adjustedInput);

      // Gera o plano semanal com retry se confidenceScore < 72
      const MAX_RETRIES = 3;
      let plan = generateWeeklyPlan(adjustedInput);
      let shoppingResult = generateShoppingList(adjustedInput, plan);
      let shoppingValidation = validateShoppingList(adjustedInput, plan, shoppingResult.items, shoppingResult.totalProtein);

      for (let attempt = 1; attempt < MAX_RETRIES && shoppingValidation.confidenceScore < 72; attempt++) {
        console.log(`🔄 Retry ${attempt}: confidenceScore=${shoppingValidation.confidenceScore} < 72, regenerating...`);
        const retryPlan = generateWeeklyPlan(adjustedInput);
        const retryResult = generateShoppingList(adjustedInput, retryPlan);
        const retryValidation = validateShoppingList(adjustedInput, retryPlan, retryResult.items, retryResult.totalProtein);
        if (retryValidation.confidenceScore > shoppingValidation.confidenceScore) {
          plan = retryPlan;
          shoppingResult = retryResult;
          shoppingValidation = retryValidation;
        }
      }

      console.log(`✅ Plano final: confidenceScore=${shoppingValidation.confidenceScore}`);

      const {
        items,
        costTier,
        totalProtein,
        efficiencyScore,
        savingsStatus,
        substitutionsApplied,
      } = shoppingResult;
      
      console.log("🛒 Lista de compras gerada:", items.length, "itens");
      console.log("💰 Cost tier:", costTier);
      console.log("💪 Proteína total:", totalProtein.toFixed(0), "g");
      console.log("📊 Eficiência:", efficiencyScore.toFixed(2), "g protein/€");
      console.log("💵 Savings status:", savingsStatus);
      
      if (substitutionsApplied.length > 0) {
        console.log("🔄 Substituições aplicadas:", substitutionsApplied.length);
        substitutionsApplied.forEach(sub => {
          console.log(`  • ${sub.from} → ${sub.to}: ${sub.reason}`);
        });
      }

      // Atualiza o plano com a lista e custo (ajustado pelo budget)
      const completePlan: WeeklyPlan = {
        ...plan,
        shoppingList: items,
        costTier,
        totalProtein,
        efficiencyScore,
        savingsStatus,
        substitutionsApplied,
        shoppingValidation,
      };

      // Gera sugestões de receitas baseadas na lista
      const suggestions = suggestRecipes(items);
      console.log("🍳 Sugestões geradas:", suggestions.length, "receitas");

      // Atualiza o estado ANTES de salvar
      setWeeklyPlan(completePlan);
      setShoppingList(items);
      setRecipeSuggestions(suggestions);

      // Salva no histórico (LocalStorage)
      const saved = savePlan(completePlan);
      console.log("💾 Plano salvo no LocalStorage:", saved);

      // PASSO 33.1: Salva como último plano para Repeat Last Week
      saveLastWeeklyPlan(completePlan, adjustedInput);

      // PASSO 33.4: Update streak when plan is generated
      const updatedStreakData = updateStreak();
      setStreak(updatedStreakData.currentStreak);
      
      if (updatedStreakData.currentStreak > 1) {
        console.log("🔥 Streak updated:", updatedStreakData.currentStreak, "weeks!");
      }

      // Recarrega o histórico
      const updatedHistory = loadHistoryFromStorage();
      setHistory(updatedHistory);
      console.log("📚 Histórico atualizado:", updatedHistory.length, "planos");

    } catch (error) {
      console.error("❌ Erro ao gerar plano:", error);
      throw error;
    }
  }, []);

  /**
   * PASSO 33.2: Save adherence score for adaptive adjustments
   */
  const saveAdherenceScore = useCallback((score: { score: number; timestamp: string; level: "high" | "good" | "low" }) => {
    try {
      saveAdherenceScoreToStorage(score);
      
      // Update current plan with adherence score
      if (weeklyPlan) {
        const updatedPlan = {
          ...weeklyPlan,
          adherenceScore: score
        };
        setWeeklyPlan(updatedPlan);
        
        // Also update in history
        savePlan(updatedPlan);
        const updatedHistory = loadHistoryFromStorage();
        setHistory(updatedHistory);
      }
      
      console.log("✅ Adherence score saved and plan updated");
    } catch (error) {
      console.error("❌ Error saving adherence score:", error);
    }
  }, [weeklyPlan]);

  /**
   * PASSO 33.2: Get last adherence score
   */
  const getLastAdherenceScore = useCallback((): { score: number; timestamp: string; level: "high" | "good" | "low" } | null => {
    return loadAdherenceScoreFromStorage();
  }, []);

  /**
   * PASSO 33.4: Get streak data
   */
  const getStreakData = useCallback((): StreakData => {
    return loadStreakData();
  }, []);

  /**
   * Marca/desmarca um item da lista como comprado
   */
  const toggleItemPurchased = useCallback((id: string) => {
    setShoppingList(prevList => {
      const persistedPurchasedIds = loadPurchasedItems();

      if (persistedPurchasedIds.has(id)) {
        persistedPurchasedIds.delete(id);
      } else {
        persistedPurchasedIds.add(id);
      }

      const updatedList = prevList.map(item => ({
        ...item,
        purchased: persistedPurchasedIds.has(item.id)
      })) as FoodItem[];
      
      // Persist purchased items to localStorage
      savePurchasedItems(Array.from(persistedPurchasedIds));
      
      return updatedList;
    });
  }, []);

  /**
   * Carrega o histórico de planos salvos do LocalStorage
   */
  const loadHistory = useCallback(() => {
    try {
      const loadedHistory = loadHistoryFromStorage();
      setHistory(loadedHistory);
      console.log("📚 Histórico recarregado:", loadedHistory.length, "planos");
    } catch (error) {
      console.error("❌ Erro ao carregar histórico:", error);
      setHistory([]);
    }
  }, []);

  /**
   * Limpa todo o histórico de planos
   */
  const clearHistory = useCallback(() => {
    try {
      const success = clearHistoryFromStorage();
      
      if (success) {
        setHistory([]);
        console.log("🗑️ Histórico limpo");
      }
      
      return success;
    } catch (error) {
      console.error("❌ Erro ao limpar histórico:", error);
      return false;
    }
  }, []);

  /**
   * Swap a single meal on a specific day with a freshly generated alternative.
   * Regenerates the shopping list after the swap so the list stays in sync.
   */
  const swapMeal = useCallback((dayIndex: number, mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    if (!weeklyPlan || !currentInput) return;

    const day = weeklyPlan.days[dayIndex];
    if (!day) return;

    const newMeal = generateSingleMeal(currentInput, mealType, day.trainingDay ?? false);

    const updatedDays = weeklyPlan.days.map((d, i) => {
      if (i !== dayIndex) return d;
      return { ...d, meals: { ...d.meals, [mealType]: newMeal } };
    });

    const updatedPlan = { ...weeklyPlan, days: updatedDays };

    const { items, costTier, totalProtein, efficiencyScore, savingsStatus, substitutionsApplied } =
      generateShoppingList(currentInput, updatedPlan);
    const shoppingValidation = validateShoppingList(currentInput, updatedPlan, items, totalProtein);

    const completePlan: WeeklyPlan = {
      ...updatedPlan,
      shoppingList: items,
      costTier,
      totalProtein,
      efficiencyScore,
      savingsStatus,
      substitutionsApplied,
      shoppingValidation,
    };

    setWeeklyPlan(completePlan);
    setShoppingList(items);
    console.log(`🔄 Swapped ${mealType} on day ${dayIndex}`);
  }, [weeklyPlan, currentInput]);

  /**
   * PASSO 33.1: Repeat Last Week - Carrega e aplica o último plano gerado
   * Returns true if successful, false if no previous plan exists
   */
  const repeatLastWeek = useCallback((): boolean => {
    try {
      const lastPlan = loadLastWeeklyPlan();
      
      if (!lastPlan) {
        console.log("⚠️ No previous plan found for Repeat Last Week");
        return false;
      }

      const { plan, input } = lastPlan;
      
      // Clear purchased items when repeating
      clearPurchasedItems();
      
      // Aplica o plano anterior
      setCurrentInput(input);
      setWeeklyPlan(plan);
      setShoppingList(plan.shoppingList || []);
      
      // Gera sugestões baseadas na lista
      const suggestions = suggestRecipes(plan.shoppingList || []);
      setRecipeSuggestions(suggestions);
      
      console.log("🔁 Repeated last week's plan successfully");
      return true;
      
    } catch (error) {
      console.error("❌ Error repeating last week:", error);
      return false;
    }
  }, []);

  /**
   * Reseta o plano atual e lista de compras
   */
  const resetPlan = useCallback(() => {
    setCurrentInput(null);
    setWeeklyPlan(null);
    setShoppingList([]);
    setRecipeSuggestions([]);
    console.log("🔄 Plano resetado");
  }, []);

  return (
    <ShoppingPlanContext.Provider
      value={{
        currentInput,
        weeklyPlan,
        shoppingList,
        recipeSuggestions,
        history,
        streak, // PASSO 33.4
        generatePlan,
        repeatLastWeek, // PASSO 33.1
        saveAdherenceScore, // PASSO 33.2
        getLastAdherenceScore, // PASSO 33.2
        getStreakData, // PASSO 33.4
        swapMeal,
        toggleItemPurchased,
        loadHistory,
        clearHistory,
        resetPlan
      }}
    >
      {children}
    </ShoppingPlanContext.Provider>
  );
}

/**
 * Hook para usar o contexto de planejamento
 */
export function useShoppingPlan(): ShoppingPlanContextData {
  const context = useContext(ShoppingPlanContext);
  
  if (!context) {
    throw new Error("useShoppingPlan must be used within ShoppingPlanProvider");
  }
  
  return context;
}

// PASSO 33.4: Export StreakData type for components
export type { StreakData };

export const __adaptiveTestables = {
  applyAdaptiveAdjustments,
  updateAdherenceSmoothingState,
  loadAdherenceSmoothingState,
};
