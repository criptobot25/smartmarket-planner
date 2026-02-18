const STORAGE_KEY = "nutripilot_history";
const LEGACY_STORAGE_KEYS = ["smartmarket_history", "smartmarket_plans"];

/**
 * Limpa todo o histórico de planos do LocalStorage
 * 
 * @returns boolean indicando sucesso da operação
 */
export function clearHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error("Erro ao limpar histórico:", error);
    return false;
  }
}

/**
 * Remove um plano específico do histórico pelo ID
 * 
 * @param planId - ID do plano a ser removido
 * @returns boolean indicando sucesso da operação
 */
export function deletePlanById(planId: string): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
      ?? LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean)
      ?? null;
    
    if (!data) {
      return false;
    }

    const plans = JSON.parse(data);
    
    // Filtra removendo o plano com o ID especificado
    const filteredPlans = plans.filter((plan: { id: string }) => plan.id !== planId);
    
    // Se nenhum plano foi removido, retorna false
    if (filteredPlans.length === plans.length) {
      return false;
    }

    // Salva a lista atualizada
    if (filteredPlans.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPlans));
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar plano:", error);
    return false;
  }
}

/**
 * Remove os planos mais antigos, mantendo apenas os N mais recentes
 * 
 * @param keepCount - Número de planos recentes a manter
 * @returns boolean indicando sucesso da operação
 */
export function trimHistory(keepCount: number): boolean {
  try {
    if (keepCount < 0) {
      throw new Error("keepCount deve ser um número positivo");
    }

    const data = localStorage.getItem(STORAGE_KEY)
      ?? LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean)
      ?? null;
    
    if (!data) {
      return true; // Nada para fazer
    }

    const plans = JSON.parse(data);
    
    // Mantém apenas os N primeiros planos (mais recentes)
    const trimmedPlans = plans.slice(0, keepCount);
    
    if (trimmedPlans.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedPlans));
    }

    return true;
  } catch (error) {
    console.error("Erro ao limitar histórico:", error);
    return false;
  }
}

/**
 * Limpa todos os dados do NutriPilot do LocalStorage
 * Útil para reset completo da aplicação
 * 
 * @returns boolean indicando sucesso da operação
 */
export function clearAllData(): boolean {
  try {
    // Remove a chave principal
    localStorage.removeItem(STORAGE_KEY);
    
    // Remove outras chaves relacionadas ao NutriPilot, se houver
    const keysToRemove = Object.keys(localStorage).filter(key =>
      key.startsWith("nutripilot_") || key.startsWith("smartmarket_")
    );
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    return true;
  } catch (error) {
    console.error("Erro ao limpar todos os dados:", error);
    return false;
  }
}
