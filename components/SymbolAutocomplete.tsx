"use client";

import { SymbolSearchField } from "./SymbolSearchField";

export function SymbolAutocomplete({
  onSelect, placeholder = "חיפוש חברה או סימול להוספה…", disabled = false,
  autoFocus = false, clearOnSelect = true, className = "",
}: {
  onSelect: (symbol: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  clearOnSelect?: boolean;
  className?: string;
}) {
  return <SymbolSearchField onSelect={onSelect} label="חיפוש סמל להוספה" placeholder={placeholder}
    disabled={disabled} autoFocus={autoFocus} clearOnSelect={clearOnSelect} className={className} />;
}
