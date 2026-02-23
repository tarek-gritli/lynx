import { AlertCircle, FileText } from "lucide-react";
import type { Review } from "@/hooks/use-reviews";

interface ReviewContentProps {
  review: Review;
}

export function ReviewContent({ review }: ReviewContentProps) {
  if (review.status === "failed" && review.error_message) {
    return (
      <section className="bg-destructive/10 border border-destructive/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="size-6 text-destructive" />
          <h2 className="text-xl font-bold">Review Failed</h2>
        </div>
        <p className="text-muted-foreground whitespace-pre-wrap">{review.error_message}</p>
      </section>
    );
  }

  if (review.status === "pending") {
    return (
      <section className="bg-warning/10 border border-warning/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="size-6 text-warning" />
          <h2 className="text-xl font-bold">Review Pending</h2>
        </div>
        <p className="text-muted-foreground">This review is currently being processed. Please check back later.</p>
      </section>
    );
  }

  if (!review.review_text) {
    return (
      <section className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="size-6 text-muted-foreground" />
          <h2 className="text-xl font-bold">No Review Available</h2>
        </div>
        <p className="text-muted-foreground">No review text is available for this pull request.</p>
      </section>
    );
  }

  return (
    <section className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="size-6 text-primary" />
        <h2 className="text-xl font-bold">Review Analysis</h2>
      </div>
      <article className="prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap text-foreground bg-background/50 p-4 rounded-lg border border-border overflow-x-auto">
          {review.review_text}
        </pre>
      </article>
    </section>
  );
}
