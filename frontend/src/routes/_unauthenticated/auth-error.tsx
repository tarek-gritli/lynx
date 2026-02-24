import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_unauthenticated/auth-error")({
	component: AuthErrorPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			provider: (search.provider as string) || "the authentication provider",
		};
	},
});

function AuthErrorPage() {
	const navigate = useNavigate();
	const { provider } = Route.useSearch();

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow dark:bg-card/50 dark:border-border/50">
				<div className="flex flex-col gap-y-1.5 p-6 text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
						<AlertCircle className="h-6 w-6 text-destructive" />
					</div>
					<div className="text-2xl font-semibold leading-none tracking-tight">
						Authentication Failed
					</div>
					<div className="text-sm text-muted-foreground">
						We encountered an error while trying to authenticate with {provider}
					</div>
				</div>
				<div className="p-6 pt-0">
					<div className="rounded-md bg-muted p-4">
						<p className="text-sm text-muted-foreground">
							<span className="font-semibold">Error:</span> An unexpected error
							occurred during authentication. Please try again later or contact
							support if the issue persists.
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-2 p-6 pt-0">
					<Button
						className="w-full"
						onClick={() => navigate({ to: "/landing" })}
					>
						Back to Home
					</Button>
				</div>
			</div>
		</div>
	);
}
