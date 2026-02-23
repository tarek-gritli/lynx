import { Skeleton } from "@/components/ui/skeleton";

export function TemplateSkeleton() {
	return (
		<article className="border border-border rounded-xl p-6 bg-card">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Skeleton className="h-6 w-32" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-8 w-24" />
					<Skeleton className="h-8 w-8" />
					<Skeleton className="h-8 w-8" />
				</div>
			</div>
			<Skeleton className="h-32 w-full rounded-lg" />
			<Skeleton className="h-4 w-48 mt-2" />
		</article>
	);
}
