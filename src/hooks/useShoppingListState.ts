import { useCallback, useMemo } from "react";
import { aggregateShoppingList, type AggregatedShoppingItem } from "../core/logic/aggregateShoppingList";
import type { FoodItem } from "../core/models/FoodItem";

type ShoppingListItem = FoodItem & { purchased?: boolean };

interface UseShoppingListStateParams {
  shoppingList: ShoppingListItem[];
  planDays: number;
  toggleItemPurchased: (id: string) => void;
}

function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

export function useShoppingListState({
  shoppingList,
  planDays,
  toggleItemPurchased
}: UseShoppingListStateParams) {
  const purchasedById = useMemo(() => {
    const map = new Map<string, boolean>();

    shoppingList.forEach((item) => {
      const previous = map.get(item.id) || false;
      map.set(item.id, previous || Boolean(item.purchased));
    });

    return map;
  }, [shoppingList]);

  const aggregatedShoppingList = useMemo(
    () =>
      aggregateShoppingList(shoppingList, planDays).map((item) => ({
        ...item,
        sourceIds: uniqueIds(item.sourceIds)
      })),
    [shoppingList, planDays]
  );

  const purchasedCount = useMemo(
    () => aggregatedShoppingList.filter((item) => item.purchased).length,
    [aggregatedShoppingList]
  );
  const totalCount = aggregatedShoppingList.length;
  const shoppingProgress = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  const toggleAggregatedItemPurchased = useCallback(
    (item: AggregatedShoppingItem) => {
      const ids = uniqueIds(item.sourceIds);
      if (ids.length === 0) {
        return;
      }

      const targetPurchased = !Boolean(item.purchased);

      ids.forEach((id) => {
        const currentPurchased = purchasedById.get(id) || false;
        if (currentPurchased !== targetPurchased) {
          toggleItemPurchased(id);
        }
      });
    },
    [purchasedById, toggleItemPurchased]
  );

  const getAggregatedItemKey = useCallback((item: AggregatedShoppingItem) => {
    const ids = uniqueIds(item.sourceIds).join("|");
    return `${item.category}::${item.name.toLowerCase()}::${item.unit.toLowerCase()}::${ids}`;
  }, []);

  return {
    aggregatedShoppingList,
    purchasedCount,
    totalCount,
    shoppingProgress,
    toggleAggregatedItemPurchased,
    getAggregatedItemKey
  };
}
