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
          setWeeklyPlan(latestPlan);
          setCurrentInput(latestPlan.planInput);
          setShoppingList(latestPlan.shoppingList);
          
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

      // Salva o input atual
      setCurrentInput(input);

      // Gera o plano semanal
      const plan = generateWeeklyPlan(input);
      console.log("📋 Plano semanal gerado:", plan);

      // Gera a lista de compras baseada no plano (NOVA ASSINATURA)
      const { items, totalEstimatedCost, budgetStatus, adjustmentsMade } = generateShoppingList(input, plan);
      console.log("🛒 Lista de compras gerada:", items.length, "itens");
      console.log("💰 Custo total estimado:", totalEstimatedCost);
      console.log("💵 Budget status:", budgetStatus);
      if (adjustmentsMade.length > 0) {
        console.log("🔄 Adjustments made:", adjustmentsMade);
      }

      // Atualiza o plano com a lista e custo
      const completePlan: WeeklyPlan = {
        ...plan,
        shoppingList: items,
        totalCost: totalEstimatedCost
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
      return prevList.map(item => {
        if (item.id === id) {
          return {
            ...item,
            purchased: !(item as FoodItem & { purchased?: boolean }).purchased
          } as FoodItem & { purchased: boolean };
        }
        return item;
      });
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
