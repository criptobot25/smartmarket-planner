# PASSO 35: Grocery Unit Normalization ✅

**Status**: COMPLETE  
**Tests**: 42 new tests (401 total)  
**Goal**: Shopping list must use real-world supermarket units

---

## 📋 Overview

PASSO 35 transforms the shopping list from technical units (kg, g) to real-world supermarket units that match how people actually shop. Instead of showing "1.2kg yogurt", the app now shows "6 tubs (200g each)".

### Before PASSO 35:
- ❌ "1.2kg yogurt" → confusing
- ❌ "0.3kg tomatoes" → not intuitive  
- ❌ "360g tuna" → need calculator

### After PASSO 35:
- ✅ "6 tubs (200g each)" → clear packaging
- ✅ "2 tomatoes" → countable units
- ✅ "3 cans (120g each)" → supermarket-native

---

## 🏗️ Architecture

### 1. **QuantityNormalizer.ts** (Core Logic)
Location: [`src/core/utils/QuantityNormalizer.ts`](../src/core/utils/QuantityNormalizer.ts)

**Purpose**: Convert raw quantities to real-world units

**Display Units**:
- `kg` / `g` - Solid foods (default)
- `L` / `ml` - Liquids
- `units` - Countable items (tomatoes, apples)
- `tubs` - Yogurt, Greek yogurt
- `bottles` - Milk, oils
- `cans` - Tuna, sardines
- `packs` - Mushrooms
- `bunches` - Spinach, kale, herbs
- `heads` - Broccoli, cauliflower, garlic, lettuce
- `cloves` - Garlic (future)

**Key Functions**:
```typescript
// Normalize single item
normalizeQuantity(foodName: string, quantity: number, unit: string)
  → NormalizedQuantity

// Normalize FoodItem
normalizeFoodItem(item: FoodItem)
  → FoodItem & { normalizedQuantity }

// Normalize entire shopping list
normalizeShoppingList(items: FoodItem[])
  → Array<FoodItem & { normalizedQuantity }>
```

### 2. **Unit Conversion Rules**

**Dairy**:
- Yogurt (plain): 200g → 1 tub
- Greek yogurt: 200g → 1 tub
- Milk (whole/skim): 1000ml → 1 bottle

**Canned Proteins**:
- Tuna (canned): 120g → 1 can
- Sardines (canned): 120g → 1 can

**Oils**:
- Olive oil: 500ml → 1 bottle
- Coconut oil: 400ml → 1 bottle

**Countable Vegetables**:
- Tomatoes: 150g → 1 unit
- Bell peppers: 200g → 1 unit
- Onions: 150g → 1 unit
- Broccoli: 300g → 1 head
- Cauliflower: 500g → 1 head
- Lettuce: 300g → 1 head
- Garlic: 50g → 1 head

**Bunched Vegetables**:
- Spinach (fresh): 200g → 1 bunch
- Kale: 200g → 1 bunch
- Parsley: 50g → 1 bunch
- Cilantro: 50g → 1 bunch

**Countable Fruits**:
- Bananas: 120g → 1 unit
- Apples: 180g → 1 unit
- Oranges: 150g → 1 unit
- Lemons: 100g → 1 unit
- Avocados: 150g → 1 unit

---

## 🎯 Examples

### Real-World Conversions:

```typescript
// Yogurt
normalizeQuantity("Yogurt (plain)", 1.2, "kg")
→ "6 tubs (200g each)"

// Tomatoes
normalizeQuantity("Tomatoes", 0.3, "kg")
→ "2 units"

// Tuna
normalizeQuantity("Tuna (canned)", 360, "g")
→ "3 cans (120g each)"

// Milk
normalizeQuantity("Milk (whole)", 2, "L")
→ "2 bottles (1L each)"

// Spinach
normalizeQuantity("Spinach (fresh)", 400, "g")
→ "2 bunches (200g each)"

// Garlic
normalizeQuantity("Garlic", 50, "g")
→ "1 head"

// Broccoli
normalizeQuantity("Broccoli", 600, "g")
→ "2 heads"
```

### Default Conversions (No Specific Rule):

```typescript
// Chicken (no rule) → use kg/g
normalizeQuantity("Chicken breast", 2.5, "kg")
→ "2.50kg"

// Rice (no rule) → use kg/g
normalizeQuantity("Brown rice", 750, "g")
→ "750g"

// Almond milk (liquid keyword) → use L/ml
normalizeQuantity("Almond milk", 1500, "ml")
→ "1.50L"
```

---

## 🧪 Test Coverage

### **Test File**: [`src/tests/QuantityNormalization.test.ts`](../src/tests/QuantityNormalization.test.ts)

**42 Tests Across 14 Suites**:

1. **Yogurt Normalization (Tubs)** - 4 tests
   - 1200g → 6 tubs
   - 400g → 2 tubs
   - 150g → 1 tub (round up)
   - Greek yogurt handling

2. **Milk Normalization (Bottles)** - 3 tests
   - 2L → 2 bottles
   - 1500ml → 2 bottles (round up)
   - 750ml → 1 bottle

3. **Canned Foods Normalization** - 3 tests
   - 360g tuna → 3 cans
   - 240g sardines → 2 cans
   - Partial can rounding

4. **Countable Vegetables (Units)** - 5 tests
   - 300g tomatoes → 2 units
   - 0.5kg bell peppers → 3 units
   - 150g onions → 1 unit
   - 600g broccoli → 2 heads
   - 50g garlic → 1 head

5. **Bunched Vegetables** - 3 tests
   - 400g spinach → 2 bunches
   - 200g kale → 1 bunch
   - 50g parsley → 1 bunch

6. **Oil Normalization (Bottles)** - 2 tests
   - 1kg olive oil → 2 bottles
   - 400g coconut oil → 1 bottle

7. **Countable Fruits** - 3 tests
   - 360g bananas → 3 units
   - 540g apples → 3 units
   - 300g avocados → 2 units

8. **Default Conversions (No Specific Rule)** - 5 tests
   - 2.5kg chicken → 2.5kg (default)
   - 750g rice → 750g (default)
   - 1200g oats → 1.2kg (default)
   - Liquid detection (milk, oil)

9. **FoodItem Normalization** - 2 tests
   - Preserve all properties
   - Normalize countable items

10. **Shopping List Normalization** - 2 tests
    - Normalize entire list
    - Preserve original quantities

11. **Conversion Support Queries** - 2 tests
    - Get supported conversions list
    - Check if food supports conversion

12. **Edge Cases & Rounding** - 4 tests
    - Always round up
    - Very small quantities
    - Very large quantities
    - Exact package sizes

13. **Real-World Shopping Scenarios** - 2 tests
    - Realistic grocery list (7 items)
    - Supermarket-native UX

14. **Singular vs Plural Unit Names** - 2 tests
    - Singular for 1 item ("1 tub")
    - Plural for multiple ("2 tubs")

---

## 🔄 Integration

### **ShoppingListPage.tsx**

**Before**:
```typescript
<span className="item-quantity">
  {formatQuantity(item.name, item.quantity, item.unit)}
</span>
```

**After**:
```typescript
const normalized = normalizeQuantity(item.name, item.quantity, item.unit);

<span className="item-quantity">
  {normalized.displayText}
</span>
```

### **ShareCard.tsx**
Can use normalized units for social sharing (future enhancement)

---

## 🎨 UI/UX Impact

### **Shopping List Display**:

**Before**:
```
Dairy 🥛
□ Yogurt (plain) - 1.2kg
□ Milk (whole) - 2L

Vegetables 🥬
□ Tomatoes - 0.3kg
□ Spinach (fresh) - 400g
```

**After**:
```
Dairy 🥛
□ Yogurt (plain) - 6 tubs (200g each)
□ Milk (whole) - 2 bottles (1L each)

Vegetables 🥬
□ Tomatoes - 2 units
□ Spinach (fresh) - 2 bunches (200g each)
```

### **Benefits**:
- ✅ **Supermarket-native**: Matches real packaging
- ✅ **No calculator needed**: "2 tomatoes" vs "0.3kg"
- ✅ **Confidence**: Users know exactly what to buy
- ✅ **Professional**: Shows understanding of shopping UX

---

## 📊 Conversion Logic

### **Rounding Strategy**:
```typescript
// Always round UP to ensure enough quantity
const packageCount = Math.ceil(quantityInGrams / packageSize);

// Example: 151g tomatoes
// 151g / 150g = 1.007
// Math.ceil(1.007) = 2 tomatoes ✅
```

### **Liquid Detection**:
```typescript
const liquidKeywords = ["milk", "oil", "juice", "water", "broth", "stock"];
const isLiquid = liquidKeywords.some(keyword => 
  foodName.toLowerCase().includes(keyword)
);

// If liquid → use L/ml
// If solid → use kg/g
```

### **Singular/Plural**:
```typescript
function getUnitName(unit: DisplayUnit, count: number): string {
  return count === 1 ? singularForms[unit] : pluralForms[unit];
}

// 1 bottle, 2 bottles
// 1 tub, 5 tubs
// 1 head, 2 heads
```

---

## 🚀 Future Enhancements

### **Potential Additions**:
1. **More Foods**:
   - Bread (loaves)
   - Cheese (blocks, slices)
   - Pasta (packs)
   - Cereal (boxes)

2. **Regional Variations**:
   - US units (lb, oz, cups)
   - Metric (kg, L, ml)
   - UK units (pints, stones)

3. **Store-Specific Packaging**:
   - Costco bulk sizes
   - Trader Joe's specific packs
   - Local supermarket standards

4. **Smart Suggestions**:
   - "Buy family pack (cheaper per unit)"
   - "Individual portions available"

5. **Price Optimization**:
   - Show price per unit type
   - "6 tubs vs 2 large containers"

---

## 📁 Files Created/Modified

### **New Files**:
1. `src/core/utils/QuantityNormalizer.ts` - Core normalization logic (270 lines)
2. `src/tests/QuantityNormalization.test.ts` - 42 comprehensive tests (520 lines)

### **Modified Files**:
1. `src/app/pages/ShoppingListPage.tsx` - Use normalized units in UI
2. `src/app/components/ShareCard.tsx` - Ready for normalized units (future)

---

## ✅ Success Criteria

- [x] **Yogurt** → tubs (200g packaging)
- [x] **Milk** → bottles (1L packaging)
- [x] **Tuna** → cans (120g standard)
- [x] **Tomatoes** → countable units
- [x] **Spinach** → bunches
- [x] **Oils** → bottles
- [x] **Default conversions** for unmatched foods
- [x] **Liquid detection** (milk, oil, juice)
- [x] **Always round up** (ensure enough)
- [x] **Singular/plural** handling
- [x] **42 tests passing** (100% coverage)
- [x] **UI integration** complete
- [x] **Supermarket-native UX** achieved

---

## 💡 Key Insights

### **Psychology of Shopping**:
- People think in **packages**, not grams
- Countable items (tomatoes, apples) feel more intuitive
- Package sizes (tubs, bottles) match supermarket reality

### **UX Best Practices**:
- No decimals for countable items ("2 tomatoes" not "2.1 tomatoes")
- Show package size for clarity ("200g each")
- Always round UP (better to have extra than not enough)

### **Technical Decisions**:
- Extensible conversion rules (easy to add new foods)
- Fallback to kg/g for unknown foods
- Preserve original values for calculations
- Separate display logic from business logic

---

**PASSO 35 COMPLETE** ✅  
Shopping list now feels supermarket-native with real-world units!
