interface HistoryHeaderProps {
  totalReviews: number;
}

export function HistoryHeader({ totalReviews }: HistoryHeaderProps) {
  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Review History</h1>
        <p className="text-muted-foreground">
          Manage and track your code quality across all integrated repositories.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="bg-card px-4 py-2 rounded-lg border border-border">
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider block mb-1">
            Total Reviews
          </span>
          <div className="text-xl font-bold">
            {totalReviews.toLocaleString()}
          </div>
        </div>
      </div>
    </header>
  );
}
