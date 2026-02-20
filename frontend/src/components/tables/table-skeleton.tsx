import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showFooter?: boolean;
}

export default function TableSkeleton({
  rows = 5,
  columns = 4,
  showFooter = true,
}: TableSkeletonProps) {
  return (
    <div className="rounded-xl border border-primary/20 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              {Array.from({ length: columns }).map((_, index) => (
                <TableHead key={`header-${index}`}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="p-4"
                  >
                    <Skeleton
                      className={`h-4 ${
                        colIndex === 0
                          ? "w-32"
                          : colIndex === 1
                            ? "w-20"
                            : "w-24"
                      }`}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {showFooter && (
        <div className="p-4 border-t border-primary/20 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      )}
    </div>
  );
}
