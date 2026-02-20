import { createFileRoute } from "@tanstack/react-router";
import {
  Braces,
  ChartColumnIncreasing,
  CircleCheck,
  CircleX,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import KPICard from "@/components/cards/kpi";
import KPISkeleton from "@/components/cards/kpi-skeleton";
import RecentReviewsTable from "@/components/tables/recent-reviews";
import { Input } from "@/components/ui/input";
import { useReviews } from "@/hooks/use-reviews";
import { useStats } from "@/hooks/use-stats";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { stats, isLoading: statsLoading } = useStats();
  const {
    reviews: recentReviews,

    pagination,
    isLoading: reviewsLoading,
  } = useReviews({ limit: 5 });
  const [query, setQuery] = useState("");
  const kpiCards = useMemo(
    () => [
      {
        title: "Total Reviews",
        icon: ChartColumnIncreasing,
        iconClass: "text-primary",
        value: stats.totalReviews,
        change: stats.changes.totalReviews,
      },
      {
        title: "Successful Reviews",
        icon: CircleCheck,
        iconClass: "text-success",
        value: stats.successfulReviews,
        change: stats.changes.successfulReviews,
      },
      {
        title: "Used Tokens",
        icon: Braces,
        iconClass: "text-warning",
        value: stats.totalTokens,
        change: stats.changes.totalTokens,
      },
      {
        title: "Failed Reviews",
        icon: CircleX,
        iconClass: "text-destructive",
        value: stats.failedReviews,
        change: stats.changes.failedReviews,
        inverted: true,
      },
    ],
    [stats],
  );
  const filteredReviews = useMemo(
    () =>
      recentReviews.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.repo_name.toLowerCase().includes(q) ||
          r.model.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
        );
      }),
    [query, recentReviews],
  );

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Metrics Overview</h2>
          <p className="text-muted-foreground">
            Track your repository review health and token usage.
          </p>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          <>
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
          </>
        ) : (
          kpiCards.map((card, index) => (
            <KPICard
              key={`${card.title}-${index}`}
              title={card.title}
              icon={card.icon}
              iconClass={card.iconClass}
              value={card.value}
              change={card.change}
              inverted={card.inverted}
            />
          ))
        )}
      </div>
      <section className="mt-8">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-medium">Recent Reviews</h3>
          <div className="relative w-full sm:w-auto">
            <Input
              className="pl-9 pr-4 py-1.5 bg-primary/5 border rounded-lg text-sm text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none w-full sm:w-64"
              placeholder="Search repositories..."
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search repositories"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>
        <RecentReviewsTable
          reviews={filteredReviews}
          isLoading={reviewsLoading}
          totalCount={pagination?.total}
        />
      </section>
    </main>
  );
}
