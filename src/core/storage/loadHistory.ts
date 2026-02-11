import { WeeklyPlan } from "../models/WeeklyPlan";

const STORAGE_KEY = "smartmarket_plans";

/**
 * Carrega o histórico de planos do LocalStorage
 * Retorna os planos ordenados do mais recente ao mais antigo
 * 
 * @returns Array de planos salvos (máximo 3)
 */
export function loadHistory(): WeeklyPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);
    
    // Converte as datas de string para Date e valida estrutura
    const plans: WeeklyPlan[] = parsed.map((plan: WeeklyPlan) => ({
      ...plan,
      createdAt: new Date(plan.createdAt)
    }));

    // Ordena por data de criação (mais recente primeiro)
    return plans.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return [];
  }
}

/**
 * Carrega um plano específico pelo ID
 * 
 * @param planId - ID do plano a ser carregado
 * @returns Plano encontrado ou null
 */
export function loadPlanById(planId: string): WeeklyPlan | null {
  try {
    const plans = loadHistory();
    const plan = plans.find(p => p.id === planId);
    
    return plan || null;
  } catch (error) {
    console.error("Erro ao carregar plano por ID:", error);
    return null;
  }
}

/**
 * Carrega o plano mais recente
 * 
 * @returns Plano mais recente ou null se não houver planos
 */
export function loadLatestPlan(): WeeklyPlan | null {
  try {
    const plans = loadHistory();
    
    if (plans.length === 0) {
      return null;
    }

    return plans[0]; // Primeiro item é o mais recente
  } catch (error) {
    console.error("Erro ao carregar último plano:", error);
    return null;
  }
}

/**
 * Verifica se existe algum plano salvo
 * 
 * @returns true se há planos salvos
 */
export function hasHistory(): boolean {
  const plans = loadHistory();
  return plans.length > 0;
}

/**
 * Retorna o número de planos salvos
 * 
 * @returns Quantidade de planos no histórico
 */
export function getHistoryCount(): number {
  const plans = loadHistory();
  return plans.length;
}
