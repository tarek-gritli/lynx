import { Link } from "@tanstack/react-router";
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

export default function RecentReviewsTable({
  reviews,
}: {
  reviews: {
    id: number;
    repository: string;
    status: string;
    model: string;
    time: string;
  }[];
}) {
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
                <TableCell className="p-4">{review.repository}</TableCell>
                <TableCell className="p-4">
                  <StatusBadge status={review.status} />
                </TableCell>
                <TableCell className="p-4">
                  <span className="text-muted-foreground bg-primary/10 px-2 py-1 rounded-md">
                    {review.model}
                  </span>
                </TableCell>
                <TableCell className="p-4 text-muted-foreground">
                  {review.time}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t border-primary/20 flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {reviews.length} of {reviews.length} reviews
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
