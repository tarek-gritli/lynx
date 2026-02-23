import { format } from "date-fns";
import { Calendar, Cpu, Zap } from "lucide-react";
import type { Review } from "@/hooks/use-reviews";

interface ReviewMetadataProps {
	review: Review;
}

export function ReviewMetadata({ review }: ReviewMetadataProps) {
	return (
		<section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
			<article className="bg-card border border-border rounded-xl p-4">
				<div className="flex items-center gap-3 mb-2">
					<Cpu className="size-5 text-primary" />
					<h2 className="font-semibold text-sm text-muted-foreground uppercase">
						Model Info
					</h2>
				</div>
				<p className="text-lg font-bold">{review.model}</p>
				<p className="text-sm text-muted-foreground mt-1">
					Provider: {review.provider}
				</p>
			</article>

			<article className="bg-card border border-border rounded-xl p-4">
				<div className="flex items-center gap-3 mb-2">
					<Zap className="size-5 text-warning" />
					<h2 className="font-semibold text-sm text-muted-foreground uppercase">
						Token Usage
					</h2>
				</div>
				<p className="text-lg font-bold">
					{review.total_tokens.toLocaleString()}
				</p>
				<p className="text-sm text-muted-foreground mt-1">
					Prompt: {review.prompt_tokens.toLocaleString()} • Completion:{" "}
					{review.completion_tokens.toLocaleString()}
				</p>
			</article>

			<article className="bg-card border border-border rounded-xl p-4">
				<div className="flex items-center gap-3 mb-2">
					<Calendar className="size-5 text-info" />
					<h2 className="font-semibold text-sm text-muted-foreground uppercase">
						Created
					</h2>
				</div>
				<p className="text-lg font-bold">
					{format(new Date(review.created_at), "MMM d, yyyy")}
				</p>
				<p className="text-sm text-muted-foreground mt-1">
					{format(new Date(review.created_at), "h:mm a")}
				</p>
			</article>
		</section>
	);
}
