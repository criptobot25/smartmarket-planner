"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useShoppingPlan } from "../../../src/contexts/ShoppingPlanContext";
import { AppNav } from "../../components/AppNav";
import {
  getTodayContext,
  getCurrentMealSlot,
  getMealLabelPt,
  getMealEmoji,
} from "../../lib/dayContext";
import type { DayPlan, Meal, MealType } from "../../../src/core/models/WeeklyPlan";

const DAY_MAP: Record<number, string> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

const STORAGE_KEY = "nutripilot_eaten_meals";

type EatenState = Record<string, boolean>; // key: "YYYY-MM-DD:mealType"

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadEaten(): EatenState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, EatenState>;
    return parsed[todayKey()] ?? {};
  } catch {
    return {};
  }
}

function saveEaten(state: EatenState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, EatenState>) : {};
    // Keep only last 7 days
    const keys = Object.keys(all).sort().slice(-6);
    const trimmed: Record<string, EatenState> = {};
    for (const k of keys) trimmed[k] = all[k];
    trimmed[todayKey()] = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

export default function TodayPage() {
  const { weeklyPlan, swapMeal } = useShoppingPlan();
  const ctx = useMemo(() => getTodayContext(), []);
  const currentSlot = useMemo(() => getCurrentMealSlot(), []);
  const [eaten, setEaten] = useState<EatenState>({});
  const [swapping, setSwapping] = useState<MealType | null>(null);

  useEffect(() => {
    setEaten(loadEaten());
  }, []);

  const todayDayIndex: number = useMemo(() => {
    if (!weeklyPlan) return -1;
    const dayKey = DAY_MAP[new Date().getDay()];
    return weeklyPlan.days.findIndex((d) => d.day === dayKey);
  }, [weeklyPlan]);

  const todayPlan: DayPlan | null = useMemo(() => {
    if (!weeklyPlan || todayDayIndex < 0) return null;
    return weeklyPlan.days[todayDayIndex] ?? null;
  }, [weeklyPlan, todayDayIndex]);

  const meals: Array<{ slot: MealType; meal: Meal | null }> = useMemo(() => {
    if (!todayPlan) return [];
    return [
      { slot: "breakfast", meal: todayPlan.meals.breakfast },
      { slot: "lunch", meal: todayPlan.meals.lunch },
      { slot: "dinner", meal: todayPlan.meals.dinner },
      { slot: "snack", meal: todayPlan.meals.snack },
    ].filter((m) => m.meal !== null) as Array<{ slot: MealType; meal: Meal }>;
  }, [todayPlan]);

  const toggleEaten = (slot: MealType) => {
    const next = { ...eaten, [slot]: !eaten[slot] };
    setEaten(next);
    saveEaten(next);
  };

  const handleSwap = (slot: MealType) => {
    if (todayDayIndex < 0 || swapping) return;
    setSwapping(slot);
    // Small delay so React can update UI before the synchronous swap computation
    setTimeout(() => {
      swapMeal(todayDayIndex, slot);
      setSwapping(null);
    }, 50);
  };

  const eatenCount = meals.filter((m) => eaten[m.slot]).length;
  const totalProteinEaten = meals
    .filter((m) => eaten[m.slot])
    .reduce((sum, m) => sum + (m.meal?.protein ?? 0), 0);
  const proteinTarget = weeklyPlan?.proteinTargetPerDay ?? 0;
  const proteinPct = proteinTarget > 0 ? Math.min(100, Math.round((totalProteinEaten / proteinTarget) * 100)) : 0;

  return (
    <div className="np-shell">
      <AppNav />

      <main className="np-main today-page">
        {/* Day banner */}
        <div className="today-banner">
          <span className="today-banner-emoji">{ctx.emoji}</span>
          <div>
            <p className="today-banner-day">{ctx.labelPt}</p>
            <p className="today-banner-message">{ctx.bannerPt}</p>
          </div>
          {ctx.isPrepDay && (
            <Link href="/app/prep" className="today-banner-cta">Abrir Preparo →</Link>
          )}
          {ctx.isShoppingDay && (
            <Link href="/app/list" className="today-banner-cta">Ver Lista →</Link>
          )}
        </div>

        {/* No plan state */}
        {!weeklyPlan && (
          <div className="today-empty">
            <p className="today-empty-icon">📋</p>
            <h2>Ainda não tens plano para esta semana</h2>
            <p>Gera o teu plano em 2 minutos e vê aqui o que comes hoje.</p>
            <Link href="/app" className="btn-primary">Gerar plano</Link>
          </div>
        )}

        {/* Meals for today */}
        {weeklyPlan && meals.length > 0 && (
          <>
            {/* Protein progress */}
            <section className="today-protein-bar">
              <div className="today-protein-header">
                <span className="today-protein-label">Proteína hoje</span>
                <span className="today-protein-value">
                  {Math.round(totalProteinEaten)}g / {Math.round(proteinTarget)}g
                </span>
              </div>
              <div className="today-protein-track">
                <div
                  className="today-protein-fill"
                  style={{ width: `${proteinPct}%` }}
                />
              </div>
              <p className="today-protein-hint">
                {eatenCount === 0
                  ? "Marca as refeições à medida que comes"
                  : eatenCount === meals.length
                  ? `Meta do dia atingida! ${Math.round(totalProteinEaten)}g de proteína 💪`
                  : `${meals.length - eatenCount} refeição${meals.length - eatenCount > 1 ? "ões" : ""} por comer`}
              </p>
            </section>

            {/* Meal cards */}
            <section className="today-meals">
              {meals.map(({ slot, meal }) => {
                if (!meal) return null;
                const isNow = slot === currentSlot;
                const isDone = !!eaten[slot];
                return (
                  <div
                    key={slot}
                    className={`today-meal-card ${isNow && !isDone ? "now" : ""} ${isDone ? "done" : ""}`}
                  >
                    <div className="today-meal-left">
                      <span className="today-meal-emoji">{getMealEmoji(slot)}</span>
                      <div className="today-meal-info">
                        <span className="today-meal-type">
                          {getMealLabelPt(slot)}
                          {isNow && !isDone && (
                            <span className="today-meal-now-badge">Agora</span>
                          )}
                        </span>
                        <span className="today-meal-name">{(meal as Meal).name}</span>
                        <span className="today-meal-protein">{Math.round((meal as Meal).protein)}g proteína</span>
                      </div>
                    </div>
                    <div className="today-meal-actions">
                      {!isDone && (
                        <button
                          type="button"
                          className="today-meal-swap"
                          onClick={() => handleSwap(slot)}
                          disabled={swapping === slot}
                          aria-label="Trocar refeição"
                          title="Trocar refeição"
                        >
                          {swapping === slot ? "..." : "🔄"}
                        </button>
                      )}
                      <button
                        type="button"
                        className={`today-meal-check ${isDone ? "checked" : ""}`}
                        onClick={() => toggleEaten(slot)}
                        aria-label={isDone ? "Marcar como não comido" : "Marcar como comido"}
                      >
                        {isDone ? "✓" : ""}
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Bottom actions */}
            <div className="today-actions">
              <Link href="/app/list" className="today-action-btn">
                🛒 Lista de compras
              </Link>
              <Link href="/app/prep" className="today-action-btn secondary">
                🍳 Guia de preparo
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
