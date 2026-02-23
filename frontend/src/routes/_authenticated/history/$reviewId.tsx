import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ReviewContent } from "@/components/review-detail/review-content";
import { ReviewDetailHeader } from "@/components/review-detail/review-detail-header";
import { ReviewMetadata } from "@/components/review-detail/review-metadata";
import { Button } from "@/components/ui/button";
import { useReview } from "@/hooks/use-reviews";
import { ROUTES } from "@/lib/navigation";

export const Route = createFileRoute("/_authenticated/history/$reviewId")({
  component: ReviewDetailPage,
});

function ReviewDetailPage() {
  const { reviewId } = Route.useParams();
  const { review, isLoading, isError } = useReview(Number(reviewId));
  console.log("ReviewDetailPage - reviewId:", reviewId);
  console.log("ReviewDetailPage - review:", review);

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-muted-foreground">Loading review...</div>
        </div>
      </main>
    );
  }

  if (isError || !review) {
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex flex-col items-center justify-center min-h-96 gap-4">
          <div className="text-muted-foreground">Review not found</div>
          <Link to={ROUTES.HISTORY}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="mb-6">
        <Link to={ROUTES.HISTORY}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>
        </Link>
      </div>

      <ReviewDetailHeader review={review} />
      <ReviewMetadata review={review} />
      <ReviewContent review={review} />
    </main>
  );
}
