import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/use-auth";
import { queryClient } from "./lib/query-client";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	context: {
		auth: undefined!,
		queryClient,
	},
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function AuthedRouterProvider() {
	const auth = useAuth();

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally depend on user identity only
	useEffect(() => {
		router.invalidate();
	}, [auth.user]);

	return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Toaster position="top-right" />
			<AuthedRouterProvider />
		</QueryClientProvider>
	);
}

export default App;
