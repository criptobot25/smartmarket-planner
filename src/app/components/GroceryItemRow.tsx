import { AggregatedShoppingItem } from "../../core/logic/aggregateShoppingList";
import { useTranslation } from "react-i18next";
import { localizeCoverageText, localizeFoodText, localizeReasonText } from "../utils/foodLocalization";

interface GroceryItemRowProps {
  item: AggregatedShoppingItem;
  onTogglePurchased: (sourceIds: string[]) => void;
}

export function GroceryItemRow({ item, onTogglePurchased }: GroceryItemRowProps) {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const localizedName = localizeFoodText(item.name, language);
  const localizedDisplayText = localizeFoodText(item.normalizedDisplayText, language);
  const localizedCoverageText = localizeCoverageText(item.coverageText, language);
  const localizedReasonText = item.reason ? localizeReasonText(localizeFoodText(item.reason, language), language) : undefined;

  return (
    <li
      className={`item ${item.purchased ? "purchased" : ""}`}
      onClick={() => onTogglePurchased(item.sourceIds)}
    >
      <div className="item-checkbox">
        {item.purchased ? "✓" : "○"}
      </div>
      <div className="item-info">
        <span className="item-name">{localizedName} — {localizedDisplayText}</span>
        <span className="item-quantity">
          {localizedCoverageText}
        </span>
        {localizedReasonText && (
          <span className="item-reason">{localizedReasonText}</span>
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