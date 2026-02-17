# WeeklyPlan Architecture - Data Purity Guarantee

## 🎯 Core Principle: Pure Domain Models

**WeeklyPlan is a PURE domain model** - it contains ONLY business logic data, NO infrastructure concerns.

## ✅ What WeeklyPlan CONTAINS

```typescript
interface WeeklyPlan {
  // Identity
  id: string;
  createdAt: Date;
  
  // Business Data
  planInput: PlanInput;
  days: DayPlan[];
  shoppingList: FoodItem[];
  costTier: CostTier;
  
  // Macro Targets
  caloriesTargetPerDay: number;
  proteinTargetPerDay: number;
  carbsTargetPerDay: number;
  fatTargetPerDay: number;
  proteinPerMeal: number;
  carbsPerMeal: number;
  fatsPerMeal: number;
  
  // Optional Features
  totalProtein?: number;
  efficiencyScore?: number;
  savingsStatus?: 'within_savings' | 'adjusted_to_savings' | 'over_savings_minimum';
  substitutionsApplied?: Array<{...}>;
  mealPrepSummary?: MealPrepSummary;
  planHash?: string;
  adherenceScore?: {...};
}
```

## ❌ What WeeklyPlan NEVER CONTAINS

- ❌ `userId` - User association is a **storage concern**
- ❌ `premiumStatus` - Premium features are **application logic**
- ❌ `syncStatus` - Cloud sync is **infrastructure concern**
- ❌ `storageKey` - Storage keys are **persistence concern**
- ❌ Any database/storage metadata

## 🔐 Storage Layer: StoredPlan Wrapper

When persisting WeeklyPlan, the **storage layer** wraps it with user context:

```typescript
interface StoredPlan {
  userId: string;           // WHO owns this plan (storage context)
  plan: WeeklyPlan;         // WHAT is the plan (pure domain data)
  metadata?: StorageMetadata; // WHEN/HOW stored (infrastructure)
}
```

### Usage Pattern

```typescript
// ✅ CORRECT - Storage layer adds user context
const storedPlan: StoredPlan = {
  userId: user.id,
  plan: generateWeeklyPlan(input),
};
await storage.saveStoredPlan(storedPlan);

// ✅ ALSO CORRECT - Implicit wrapper via options
await storage.saveWeeklyPlan(plan, { userId: user.id });

// ❌ WRONG - Never add userId to WeeklyPlan itself
const plan = {
  ...weeklyPlan,
  userId: user.id // DON'T DO THIS!
};
```

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────┐
│   UI Layer (React Components)      │
│   - Displays plan data              │
│   - NO storage concerns             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Application Layer                 │
│   - generateWeeklyPlan()            │
│   - Pure WeeklyPlan objects         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Storage Layer (StorageProvider)   │
│   - Wraps plan with userId          │
│   - StoredPlan wrapper              │
│   - Persistence logic               │
└─────────────────────────────────────┘
```

## 📝 Benefits of This Architecture

1. **Testability**: WeeklyPlan can be tested without auth/storage setup
2. **Portability**: Plan data can move between users/systems easily
3. **Clarity**: Clear separation of concerns (domain vs infrastructure)
4. **Type Safety**: TypeScript enforces that plans are pure
5. **Reusability**: Plans can be shared, exported, imported without user coupling

## 🔍 Audit Checklist

When reviewing code, ensure:

- [ ] WeeklyPlan interface has NO userId field
- [ ] WeeklyPlan interface has NO premiumStatus field
- [ ] WeeklyPlan interface has NO storage metadata
- [ ] Storage operations use StoredPlan or StorageOptions
- [ ] User association happens at storage layer only
- [ ] Domain logic functions accept pure WeeklyPlan

## 🚀 Migration Guide

If you find code violating this architecture:

```typescript
// ❌ BAD - Plan mixed with user data
interface WeeklyPlan {
  userId: string;  // REMOVE THIS
  plan: DayPlan[];
}

// ✅ GOOD - Separate concerns
interface WeeklyPlan {
  id: string;
  days: DayPlan[];
  // ... pure domain data only
}

interface StoredPlan {
  userId: string;  // User context at storage layer
  plan: WeeklyPlan;
}
```

---

**Last Audit**: February 17, 2026
**Status**: ✅ COMPLIANT - WeeklyPlan is pure, StoredPlan wrapper implemented
