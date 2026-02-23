import { Skeleton } from "@/components/ui/skeleton";

export function DefaultTemplateSkeleton() {
	return (
		<article className="border border-primary/30 bg-card rounded-xl p-6">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Skeleton className="size-5 rounded" />
					<Skeleton className="h-6 w-40" />
				</div>
				<Skeleton className="h-8 w-20" />
			</div>
			<Skeleton className="h-32 w-full rounded-lg" />
		</article>
	);
}
