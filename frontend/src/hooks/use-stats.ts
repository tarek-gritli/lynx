import { useQuery } from "@tanstack/react-query";
import { ApiError, api } from "@/lib/api";

interface StatsResponse {
  total_reviews: number;
  successful_reviews: number;
  failed_reviews: number;
  pending_reviews: number;
  total_tokens: number;
  period: {
    window_days: number;
    current: { start: string; end: string };
    previous: { start: string; end: string };
  };
  period_counts: {
    current: {
      total_reviews: number;
      successful_reviews: number;
      failed_reviews: number;
      total_tokens: number;
    };
    previous: {
      total_reviews: number;
      successful_reviews: number;
      failed_reviews: number;
      total_tokens: number;
    };
  };
  changes: {
    total_reviews: { percent: number; direction: "up" | "down" };
    successful_reviews: { percent: number; direction: "up" | "down" };
    failed_reviews: { percent: number; direction: "up" | "down" };
    total_tokens: { percent: number; direction: "up" | "down" };
  };
}

export function useStats() {
  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.get<StatsResponse>("/usage/stats"),
    refetchInterval: 60 * 1000,
    retry(failureCount, error) {
      if (error instanceof ApiError && error.status < 500) return false;
      return failureCount < 3;
    },
  });

  const transformedStats = {
    totalReviews: stats?.total_reviews || 0,
    successfulReviews: stats?.successful_reviews || 0,
    failedReviews: stats?.failed_reviews || 0,
    pendingReviews: stats?.pending_reviews || 0,
    totalTokens: stats?.total_tokens || 0,
    changes: {
      totalReviews: stats?.changes.total_reviews || { percent: 0, direction: "up" },
      successfulReviews: stats?.changes.successful_reviews || { percent: 0, direction: "up" },
      failedReviews: stats?.changes.failed_reviews || { percent: 0, direction: "up" },
      totalTokens: stats?.changes.total_tokens || { percent: 0, direction: "up" },
    },
  };

  return { stats: transformedStats, isLoading, isError, error };
}
