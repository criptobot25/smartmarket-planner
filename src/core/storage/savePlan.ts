import { WeeklyPlan } from "../models/WeeklyPlan";

const STORAGE_KEY = "smartmarket_plans";
const MAX_HISTORY = 3;

/**
 * Salva um plano semanal no LocalStorage
 * Mantém apenas os últimos 3 planos no histórico
 * 
 * @param plan - Plano semanal a ser salvo
 * @returns boolean indicando sucesso da operação
 */
export function savePlan(plan: WeeklyPlan): boolean {
  try {
    // Carrega histórico existente
    const existingPlans = loadPlansFromStorage();

    // Adiciona o novo plano no início do array
    const updatedPlans = [plan, ...existingPlans];

    // Limita ao número máximo de planos
    const limitedPlans = updatedPlans.slice(0, MAX_HISTORY);

    // Serializa e salva no LocalStorage
    const serializedData = JSON.stringify(limitedPlans);
    localStorage.setItem(STORAGE_KEY, serializedData);

    return true;
  } catch (error) {
    console.error("Erro ao salvar plano:", error);
    return false;
  }
}

/**
 * Carrega todos os planos do LocalStorage
 * 
 * @returns Array de planos salvos
 */
function loadPlansFromStorage(): WeeklyPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);
    
    // Converte as datas de string para Date
    return parsed.map((plan: WeeklyPlan) => ({
      ...plan,
      createdAt: new Date(plan.createdAt)
    }));
  } catch (error) {
    console.error("Erro ao carregar planos:", error);
    return [];
  }
}

/**
 * Retorna o número máximo de planos no histórico
 * 
 * @returns Limite do histórico
 */
export function getMaxHistorySize(): number {
  return MAX_HISTORY;
}

/**
 * Verifica se há espaço para mais planos no histórico
 * 
 * @returns true se o histórico está cheio
 */
export function isHistoryFull(): boolean {
  const plans = loadPlansFromStorage();
  return plans.length >= MAX_HISTORY;
}
