import { MutationCache, matchQuery, QueryClient } from "@tanstack/react-query";

declare module "@tanstack/react-query" {
	interface Register {
		mutationMeta: {
			invalidates?: Array<readonly unknown[]>;
		};
	}
}

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60,
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
	mutationCache: new MutationCache({
		onSuccess: (_data, _variables, _context, mutation) => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					mutation.meta?.invalidates?.some((queryKey) =>
						matchQuery({ queryKey: queryKey as unknown[] }, query),
					) ?? true,
			});
		},
	}),
});
