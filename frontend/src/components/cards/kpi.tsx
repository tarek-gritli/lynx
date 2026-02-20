import type { LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

export default function KPICard(props: {
  title: string;
  icon: LucideIcon;
  iconClass: string;
  value: number;
  change: { value: number; direction: string };
  inverted?: boolean;
}) {
  return (
    <div className="p-6 rounded-xl border border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {props.title}
        </p>
        <props.icon className={props.iconClass} />
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold tracking-tight">
          {formatNumber(props.value)}
        </h3>
        {props.change && (
          <span
            className={cn(
              "text-xs font-bold px-1.5 py-0.5 rounded",
              (props.inverted ? props.change.direction === "down" : props.change.direction === "up")
                ? "text-success bg-success/10"
                : "text-destructive bg-destructive/10"
            )}
          >
            {props.change.direction === "up" ? "+" : "-"}
            {props.change.value}%
          </span>
        )}
      </div>
    </div>
  );
}
