import { useState, useCallback } from "react";
import { PlanInput } from "../core/models/PlanInput";
import { WeeklyPlan } from "../core/models/WeeklyPlan";
import { FoodItem } from "../core/models/FoodItem";
import { Recipe } from "../core/models/Recipe";
import { generateWeeklyPlan } from "../core/logic/generateWeeklyPlan";
import { generateShoppingList, calculateTotalCost } from "../core/logic/generateShoppingList";
import { suggestRecipes } from "../core/logic/suggestRecipes";
import { savePlan } from "../core/storage/savePlan";
import { loadHistory as loadHistoryFromStorage } from "../core/storage/loadHistory";
import { clearHistory as clearHistoryFromStorage } from "../core/storage/clearHistory";

interface UseShoppingPlanReturn {
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

/**
 * Hook customizado para gerenciar o planejamento de compras
 * Controla input, plano semanal, lista de compras, sugestões e histórico
 * 
 * @returns Objeto com estado e funções para gerenciar o planejamento
 */
export function useShoppingPlan(): UseShoppingPlanReturn {
  const [currentInput, setCurrentInput] = useState<PlanInput | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<FoodItem[]>([]);
  const [recipeSuggestions, setRecipeSuggestions] = useState<Recipe[]>([]);
  const [history, setHistory] = useState<WeeklyPlan[]>([]);

  /**
   * Gera um plano completo baseado no input do usuário
   * Cria plano semanal, lista de compras, sugestões e salva no histórico
   */
  const generatePlan = useCallback((input: PlanInput) => {
    try {
      // Salva o input atual
      setCurrentInput(input);

      // Gera o plano semanal
      const plan = generateWeeklyPlan(input);

      // Gera a lista de compras baseada no plano
      const list = generateShoppingList(plan);

      // Calcula o custo total
      const totalCost = calculateTotalCost(list);

      // Atualiza o plano com a lista e custo
      const completePlan: WeeklyPlan = {
        ...plan,
        shoppingList: list,
        totalCost
      };

      // Gera sugestões de receitas baseadas na lista
      const suggestions = suggestRecipes(list);

      // Atualiza o estado
      setWeeklyPlan(completePlan);
      setShoppingList(list);
      setRecipeSuggestions(suggestions);

      // Salva no histórico (LocalStorage)
      savePlan(completePlan);

      // Recarrega o histórico
      const updatedHistory = loadHistoryFromStorage();
      setHistory(updatedHistory);
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      throw error;
    }
  }, []);

  /**
   * Marca/desmarca um item da lista como comprado
   * Adiciona propriedade 'purchased' ao item
   */
  const toggleItemPurchased = useCallback((id: string) => {
    setShoppingList(prevList => {
      return prevList.map(item => {
        if (item.id === id) {
          // Adiciona propriedade purchased ao item
          // TypeScript pode reclamar, mas funcionará em runtime
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
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
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
      }
      
      return success;
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
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
  }, []);

  return {
    // Estado
    currentInput,
    weeklyPlan,
    shoppingList,
    recipeSuggestions,
    history,
    
    // Funções
    generatePlan,
    toggleItemPurchased,
    loadHistory,
    clearHistory,
    resetPlan
  };
}
