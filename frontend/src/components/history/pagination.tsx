import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Pagination as PaginationType } from "@/hooks/use-reviews";

interface PaginationProps {
	pagination: PaginationType;
	onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
	const { page, limit, total, pages } = pagination;
	const startItem = (page - 1) * limit + 1;
	const endItem = Math.min(page * limit, total);

	const getPageNumbers = () => {
		const pageNumbers: (number | string)[] = [];

		if (pages <= 7) {
			// Show all pages if total pages <= 7
			for (let i = 1; i <= pages; i++) {
				pageNumbers.push(i);
			}
		} else {
			// Always show first page
			pageNumbers.push(1);

			if (page > 3) {
				pageNumbers.push("...");
			}

			// Show pages around current page
			const start = Math.max(2, page - 1);
			const end = Math.min(pages - 1, page + 1);

			for (let i = start; i <= end; i++) {
				pageNumbers.push(i);
			}

			if (page < pages - 2) {
				pageNumbers.push("...");
			}

			// Always show last page
			pageNumbers.push(pages);
		}

		return pageNumbers;
	};

	return (
		<div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
			<p className="text-sm text-muted-foreground">
				Showing <span className="font-bold text-foreground">{startItem}</span>{" "}
				to <span className="font-bold text-foreground">{endItem}</span> of{" "}
				<span className="font-bold text-foreground">{total}</span> results
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					onClick={() => onPageChange(page - 1)}
					disabled={page === 1}
				>
					<ChevronLeft className="size-4" />
				</Button>
				{getPageNumbers().map((pageNum, index) =>
					pageNum === "..." ? (
						<span
							key={`ellipsis-${index}`}
							className="text-muted-foreground px-1"
						>
							...
						</span>
					) : (
						<Button
							key={pageNum}
							variant={page === pageNum ? "default" : "outline"}
							size="icon"
							onClick={() => onPageChange(pageNum as number)}
						>
							{pageNum}
						</Button>
					),
				)}
				<Button
					variant="outline"
					size="icon"
					onClick={() => onPageChange(page + 1)}
					disabled={page === pages}
				>
					<ChevronRight className="size-4" />
				</Button>
			</div>
		</div>
	);
}
