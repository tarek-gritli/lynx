import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Folder } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Review } from "@/hooks/use-reviews";
import { ROUTES } from "@/lib/navigation";
import TableSkeleton from "./table-skeleton";

interface ReviewsTableProps {
  reviews: Review[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ReviewsTable({
  reviews,
  isLoading = false,
  emptyMessage = "No reviews found",
}: ReviewsTableProps) {
  if (isLoading) {
    return <TableSkeleton rows={10} columns={6} />;
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="p-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-b-xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-background/50">
              <TableHead>Repository Name</TableHead>
              <TableHead>Pull Request</TableHead>
              <TableHead>Review Status</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id} className="hover:bg-primary/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Folder className="size-4 text-primary" />
                    <span className="text-sm font-semibold">
                      {review.repo_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={review.pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs bg-background px-2 py-1 rounded text-primary hover:underline inline-block"
                  >
                    #PR {review.pr_number}
                  </a>
                </TableCell>
                <TableCell>
                  <StatusBadge status={review.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {review.model}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Link to={ROUTES.HISTORY} search={{ reviewId: review.id }}>
                    <Button variant="link" size="sm" className="text-primary">
                      View Details
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
