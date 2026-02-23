import { Skeleton } from "@/components/ui/skeleton";

export default function KPISkeleton() {
	return (
		<div className="p-6 rounded-xl border border-primary/20">
			<div className="flex items-center justify-between mb-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-5 w-5 rounded" />
			</div>
			<div className="flex items-baseline gap-2">
				<Skeleton className="h-9 w-20" />
				<Skeleton className="h-5 w-12 rounded" />
			</div>
		</div>
	);
}
