import { AggregatedShoppingItem } from "../../core/logic/aggregateShoppingList";
import { useTranslation } from "react-i18next";
import { localizeCoverageText, localizeFoodText, localizeReasonText } from "../utils/foodLocalization";

interface GroceryItemRowProps {
  item: AggregatedShoppingItem;
  onTogglePurchased: (sourceIds: string[]) => void;
}

function resolveEuropeanLocale(language: string): string {
  if (language.startsWith("pt")) {
    return "pt-PT";
  }

  return "en-IE";
}

function formatDisplayQuantity(displayText: string, locale: string): string {
  return displayText.replace(
    /(\d+(?:[.,]\d+)?)(\s?)(kg|g|L|ml|pack|packs|can|cans|jar|jars|bottle|bottles|loaf|loaves|serving|servings|pacote|pacotes|lata|latas|pote|potes|garrafa|garrafas|unidade|unidades|porção|porções)/gi,
    (_, rawNumber: string, _spacer: string, unit: string) => {
      const numeric = Number.parseFloat(rawNumber.replace(",", "."));
      if (Number.isNaN(numeric)) {
        return `${rawNumber} ${unit}`;
      }

      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: Number.isInteger(numeric) ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(numeric);

      return `${formatted} ${unit}`;
    }
  );
}

export function GroceryItemRow({ item, onTogglePurchased }: GroceryItemRowProps) {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const locale = resolveEuropeanLocale(language);
  const localizedName = localizeFoodText(item.name, language);
  const localizedDisplayText = formatDisplayQuantity(localizeFoodText(item.normalizedDisplayText, language), locale);
  const localizedCoverageText = localizeCoverageText(item.coverageText, language);
  const localizedReasonText = item.reason ? localizeReasonText(localizeFoodText(item.reason, language), language) : undefined;
  const localizedPrice = item.estimatedPrice
    ? new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(item.estimatedPrice)
    : null;

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
          {localizedPrice}
        </div>
      )}
    </li>
  );
}