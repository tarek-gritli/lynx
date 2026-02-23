import { useQuery } from "@tanstack/react-query";
import { ApiError, api } from "@/lib/api";

export type ReviewStatus = "pending" | "success" | "failed";

export interface Review {
	id: number;
	user_id: number;
	provider: string;
	model: string;
	repo_name: string;
	pr_number: number;
	pr_url: string;
	status: ReviewStatus;
	error_message: string | null;
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
	review_text: string | null;
	created_at: string;
}

export interface Pagination {
	page: number;
	limit: number;
	total: number;
	pages: number;
}

export interface ReviewFilters {
	provider?: string;
	model?: string;
	repo_name?: string;
	start_date?: string;
	end_date?: string;
	status?: ReviewStatus;
}

export interface PaginatedReviewsResponse {
	reviews: Review[];
	pagination: Pagination;
	filters: ReviewFilters;
}

export interface UseReviewsOptions {
	page?: number;
	limit?: number;
	filters?: ReviewFilters;
	enabled?: boolean;
}

export function useReviews(options: UseReviewsOptions = {}) {
	const { page = 1, limit = 10, filters = {}, enabled = true } = options;

	const queryParams = new URLSearchParams();
	queryParams.set("page", page.toString());
	queryParams.set("limit", limit.toString());

	if (filters.provider) queryParams.set("provider", filters.provider);
	if (filters.model) queryParams.set("model", filters.model);
	if (filters.repo_name) queryParams.set("repo_name", filters.repo_name);
	if (filters.start_date) queryParams.set("start_date", filters.start_date);
	if (filters.end_date) queryParams.set("end_date", filters.end_date);
	if (filters.status) queryParams.set("status", filters.status);

	const { data, isLoading, isError, error, refetch } =
		useQuery<PaginatedReviewsResponse>({
			queryKey: ["reviews", page, limit, filters],
			queryFn: () =>
				api.get<PaginatedReviewsResponse>(
					`/usage/reviews?${queryParams.toString()}`,
				),
			enabled,
			refetchInterval: 60 * 1000,
			retry(failureCount, error) {
				if (error instanceof ApiError && error.status < 500) return false;
				return failureCount < 3;
			},
		});

	return {
		reviews: data?.reviews || [],
		pagination: data?.pagination,
		filters: data?.filters,
		isLoading,
		isError,
		error,
		refetch,
	};
}

export function useReview(
	reviewId: number,
	options: { enabled?: boolean } = {},
) {
	const { enabled = true } = options;

	const {
		data: review,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery<Review>({
		queryKey: ["review", reviewId],
		queryFn: () => api.get<Review>(`/usage/reviews/${reviewId}`),
		enabled: enabled && !!reviewId,
		retry(failureCount, error) {
			if (error instanceof ApiError && error.status < 500) return false;
			return failureCount < 3;
		},
	});

	return { review, isLoading, isError, error, refetch };
}
