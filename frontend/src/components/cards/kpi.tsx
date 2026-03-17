import type { LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

export default function KPICard(props: {
	title: string;
	icon: LucideIcon;
	iconClass: string;
	value: number;
	formattedValue?: string;
	change: { percent: number; direction: "up" | "down" };
	inverted?: boolean;
}) {
	return (
		<div className="p-3 sm:p-4 lg:p-6 rounded-xl border border-primary/20 min-w-0">
			<div className="flex items-center justify-between mb-1 sm:mb-2">
				<p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider truncate mr-1">
					{props.title}
				</p>
				<props.icon className={cn(props.iconClass, "size-4 sm:size-5 shrink-0")} />
			</div>
			<div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
				<h3 className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
					{props.formattedValue ?? formatNumber(props.value)}
				</h3>
				{props.change && (
					<span
						className={cn(
							"text-xs font-bold px-1.5 py-0.5 rounded",
							(
								props.inverted
									? props.change.direction === "down"
									: props.change.direction === "up"
							)
								? "text-success bg-success/10"
								: "text-destructive bg-destructive/10",
						)}
					>
						{props.change.direction === "up" ? "+" : "-"}
						{props.change.percent}%
					</span>
				)}
			</div>
		</div>
	);
}
