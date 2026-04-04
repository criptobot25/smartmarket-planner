"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { WeeklyPlan } from "../../src/core/models/WeeklyPlan";
import { getTodayContext, getCurrentMealSlot, getMealLabelPt, getMealEmoji } from "../lib/dayContext";

const DAY_MAP: Record<number, string> = {
  0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
  4: "thursday", 5: "friday", 6: "saturday",
};

interface TodayWidgetProps {
  weeklyPlan: WeeklyPlan;
}

export function TodayWidget({ weeklyPlan }: TodayWidgetProps) {
  const ctx = useMemo(() => getTodayContext(), []);
  const currentSlot = useMemo(() => getCurrentMealSlot(), []);

  const todayPlan = useMemo(() => {
    const dayKey = DAY_MAP[new Date().getDay()];
    return weeklyPlan.days.find((d) => d.day === dayKey) ?? null;
  }, [weeklyPlan]);

  if (!todayPlan) return null;

  const meals = [
    { slot: "breakfast" as const, meal: todayPlan.meals.breakfast },
    { slot: "lunch" as const, meal: todayPlan.meals.lunch },
    { slot: "dinner" as const, meal: todayPlan.meals.dinner },
    todayPlan.meals.snack ? { slot: "snack" as const, meal: todayPlan.meals.snack } : null,
  ].filter(Boolean) as Array<{ slot: "breakfast" | "lunch" | "dinner" | "snack"; meal: NonNullable<typeof todayPlan.meals.breakfast> }>;

  const nextMeal = meals.find((m) => m.slot === currentSlot) ?? meals[0];

  return (
    <div className="today-widget">
      {/* Day banner */}
      <div className="today-widget-banner">
        <span className="today-widget-emoji">{ctx.emoji}</span>
        <div className="today-widget-text">
          <strong>{ctx.labelPt}</strong>
          <span>{ctx.bannerPt}</span>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Link href={"/app/today" as any} className="today-widget-link">
          Ver plano de hoje →
        </Link>
      </div>

      {/* Current meal highlight */}
      {nextMeal && (
        <div className="today-widget-meal">
          <span className="today-widget-meal-label">
            {getMealEmoji(nextMeal.slot)} {getMealLabelPt(nextMeal.slot)}
            <span className="today-widget-now">Agora</span>
          </span>
          <span className="today-widget-meal-name">{nextMeal.meal.name}</span>
          <span className="today-widget-meal-protein">{Math.round(nextMeal.meal.protein)}g proteína</span>
        </div>
      )}

      {/* Mini meal row */}
      <div className="today-widget-meals-row">
        {meals.map(({ slot, meal }) => (
          <div
            key={slot}
            className={`today-widget-pill ${slot === currentSlot ? "active" : ""}`}
            title={meal.name}
          >
            {getMealEmoji(slot)}
            <span>{getMealLabelPt(slot).split("-")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
