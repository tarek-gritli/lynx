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

export function formatTime(timestamp: string): string {
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMin = Math.floor(diffMs / 60_000);

	if (diffMin < 1) return "Just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h ago`;
	return date.toLocaleDateString();
}
