import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import type { Review } from "@/hooks/use-reviews";
import { ROUTES } from "@/lib/navigation";
import { StatusBadge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import TableSkeleton from "./table-skeleton";

interface RecentReviewsTableProps {
  reviews: Review[];
  isLoading?: boolean;
  totalCount?: number;
}

export default function RecentReviewsTable({
  reviews,
  isLoading = false,
  totalCount,
}: RecentReviewsTableProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} columns={4} showFooter />;
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-primary/20 overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          No reviews found
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead>Repository</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="p-4">
                  <Link
                    to={ROUTES.HISTORY}
                    search={{ reviewId: review.id }}
                    className="hover:underline"
                  >
                    {review.repo_name}
                  </Link>
                </TableCell>
                <TableCell className="p-4">
                  <StatusBadge status={review.status} />
                </TableCell>
                <TableCell className="p-4">
                  <span className="text-muted-foreground bg-primary/10 px-2 py-1 rounded-md">
                    {review.model}
                  </span>
                </TableCell>
                <TableCell className="p-4 text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t border-primary/20 flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {reviews.length} of {totalCount ?? reviews.length} reviews
        </p>
        <Link
          to={ROUTES.HISTORY}
          className="px-3 py-1 bg-primary text-white rounded hover:opacity-90"
        >
          View All
        </Link>
      </div>
    </div>
  );
}
