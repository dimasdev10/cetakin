"use client";

import React, { forwardRef, useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { formatRupiah, parseRupiah } from "@/lib/utils";

export interface RupiahInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  onChange?: (value: number) => void;
  value?: number;
}

export const CurrencyInput = forwardRef<HTMLInputElement, RupiahInputProps>(
  ({ onChange, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState<string>(
      formatRupiah(value || 0)
    );

    useEffect(() => {
      setDisplayValue(formatRupiah(value || 0));
    }, [value]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value.replace(/[^\d]/g, "");
        const newValue = parseRupiah(inputValue);
        setDisplayValue(formatRupiah(newValue));
        onChange?.(newValue);
      },
      [onChange]
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        event.target.setSelectionRange(4, event.target.value.length);
      },
      []
    );

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
