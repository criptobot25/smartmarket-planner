import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { PlanInput } from "../core/models/PlanInput";
import { WeeklyPlan } from "../core/models/WeeklyPlan";
import { FoodItem } from "../core/models/FoodItem";
import { Recipe } from "../core/models/Recipe";
import { generateWeeklyPlan } from "../core/logic/generateWeeklyPlan";
import { generateShoppingList } from "../core/logic/generateShoppingList";
import { suggestRecipes } from "../core/logic/suggestRecipes";
import { savePlan } from "../core/storage/savePlan";
import { loadHistory as loadHistoryFromStorage, loadLatestPlan } from "../core/storage/loadHistory";
import { clearHistory as clearHistoryFromStorage } from "../core/storage/clearHistory";
import { userPreferencesStore } from "../core/stores/UserPreferencesStore";

const PURCHASED_ITEMS_KEY = "smartmarket_purchased_items";

/**
 * LocalStorage helpers for purchased items
 */
function savePurchasedItems(itemIds: string[]): void {
  try {
    localStorage.setItem(PURCHASED_ITEMS_KEY, JSON.stringify(itemIds));
  } catch (error) {
    console.error("❌ Error saving purchased items to localStorage:", error);
  }
}

function loadPurchasedItems(): Set<string> {
  try {
    const stored = localStorage.getItem(PURCHASED_ITEMS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Set(Array.isArray(parsed) ? parsed : []);
    }
  } catch (error) {
    console.error("❌ Error loading purchased items from localStorage:", error);
  }
  return new Set();
}

function clearPurchasedItems(): void {
  try {
    localStorage.removeItem(PURCHASED_ITEMS_KEY);
  } catch (error) {
    console.error("❌ Error clearing purchased items from localStorage:", error);
  }
}

interface ShoppingPlanContextData {
  // Estado
  currentInput: PlanInput | null;
  weeklyPlan: WeeklyPlan | null;
  shoppingList: FoodItem[];
  recipeSuggestions: Recipe[];
  history: WeeklyPlan[];
  
  // Funções
  generatePlan: (input: PlanInput) => void;
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

  /**
   * Carrega o último plano salvo ao iniciar o app (executa apenas uma vez)
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
   */
  const generatePlan = useCallback((input: PlanInput) => {
    try {
      console.log("🚀 Gerando plano com input:", input);

      // Clear purchased items when generating a new plan
      clearPurchasedItems();

      // PASSO 26: Track excluded foods as disliked preferences
      if (input.excludedFoods && input.excludedFoods.length > 0) {
        input.excludedFoods.forEach(foodName => {
          userPreferencesStore.addDislikedFood(foodName);
        });
        console.log("👎 Alimentos excluídos salvos como disliked:", input.excludedFoods);
      }

      // Salva o input atual
      setCurrentInput(input);

      // Gera o plano semanal
      const plan = generateWeeklyPlan(input);
      console.log("📋 Plano semanal gerado:", plan);

      // Gera a lista de compras baseada no plano (SmartSavingsOptimizer)
      const { 
        items, 
        costTier,
        totalProtein,
        efficiencyScore,
        savingsStatus, 
        substitutionsApplied 
      } = generateShoppingList(input, plan);
      
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
        substitutionsApplied
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
   * Marca/desmarca um item da lista como comprado
   */
  const toggleItemPurchased = useCallback((id: string) => {
    setShoppingList(prevList => {
      const updatedList = prevList.map(item => {
        if (item.id === id) {
          return {
            ...item,
            purchased: !(item as FoodItem & { purchased?: boolean }).purchased
          } as FoodItem & { purchased: boolean };
        }
        return item;
      });
      
      // Persist purchased items to localStorage
      const purchasedIds = updatedList
        .filter(item => (item as FoodItem & { purchased?: boolean }).purchased)
        .map(item => item.id);
      savePurchasedItems(purchasedIds);
      
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
        generatePlan,
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
