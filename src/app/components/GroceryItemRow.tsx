import { AggregatedShoppingItem } from "../../core/logic/aggregateShoppingList";

interface GroceryItemRowProps {
  item: AggregatedShoppingItem;
  onTogglePurchased: (sourceIds: string[]) => void;
}

export function GroceryItemRow({ item, onTogglePurchased }: GroceryItemRowProps) {
  return (
    <li
      className={`item ${item.purchased ? "purchased" : ""}`}
      onClick={() => onTogglePurchased(item.sourceIds)}
    >
      <div className="item-checkbox">
        {item.purchased ? "✓" : "○"}
      </div>
      <div className="item-info">
        <span className="item-name">{item.name} — {item.normalizedDisplayText}</span>
        <span className="item-quantity">
          {item.coverageText}
        </span>
        {item.reason && (
          <span className="item-reason">{item.reason}</span>
        )}
      </div>
      {item.estimatedPrice && (
        <div className="item-price">
          {item.estimatedPrice.toFixed(2)}
        </div>
      )}
    </li>
  );
}