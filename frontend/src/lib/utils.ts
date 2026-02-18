import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  const trim = (num: number) => {
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
  };

  if (abs >= 1_000_000_000) {
    const v = abs / 1_000_000_000;
    return `${sign}${trim(v)}b`;
  }
  if (abs >= 1_000_000) {
    const v = abs / 1_000_000;
    return `${sign}${trim(v)}m`;
  }
  if (abs >= 10_000) {
    const v = abs / 1_000;
    return `${sign}${trim(v)}k`;
  }

  return new Intl.NumberFormat().format(value);
}
