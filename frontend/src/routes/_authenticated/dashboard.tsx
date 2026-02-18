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
import RecentReviewsTable from "@/components/tables/recent-reviews";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: RouteComponent,
});

const kpiCards = [
  {
    title: "Total Reviews",
    icon: ChartColumnIncreasing,
    iconClass: "text-primary",
    value: 1284,
    change: { value: 12, direction: "up" },
  },
  {
    title: "Successful Reviews",
    icon: CircleCheck,
    iconClass: "text-success",
    value: 1150,
    change: { value: 12, direction: "down" },
  },
  {
    title: "Used Tokens",
    icon: Braces,
    iconClass: "text-warning",
    value: 850000,
    change: { value: 12, direction: "up" },
  },
  {
    title: "Failed Reviews",
    icon: CircleX,
    iconClass: "text-destructive",
    value: 134,
    change: { value: 12, direction: "up" },
  },
];

const sampleReviews = [
  {
    id: 1,
    repository: "lynx-core-api",
    status: "Passed",
    model: "GPT-4o",
    time: "2 mins ago",
  },
  {
    id: 2,
    repository: "web-frontend-main",
    status: "Failed",
    model: "Claude-3.5",
    time: "15 mins ago",
  },
  {
    id: 3,
    repository: "auth-service-v2",
    status: "Passed",
    model: "GPT-4o",
    time: "45 mins ago",
  },
  {
    id: 4,
    repository: "data-pipeline-worker",
    status: "Passed",
    model: "GPT-4o",
    time: "1 hour ago",
  },
  {
    id: 5,
    repository: "legacy-migration-tool",
    status: "Failed",
    model: "Llama-3",
    time: "3 hours ago",
  },
];

function RouteComponent() {
  const [query, setQuery] = useState("");
  const filteredReviews = useMemo(
    () =>
      sampleReviews.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.repository.toLowerCase().includes(q) ||
          r.model.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
        );
      }),
    [query],
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
        {kpiCards.map((card, index) => (
          <KPICard
            key={`${card.title}-${index}`}
            title={card.title}
            icon={card.icon}
            iconClass={card.iconClass}
            value={card.value}
            change={card.change}
          />
        ))}
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
        <RecentReviewsTable reviews={filteredReviews} />
      </section>
    </main>
  );
}
