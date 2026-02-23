import { Link, useRouter } from "@tanstack/react-router";
import { ROUTES } from "@/lib/navigation";

export function NotFound() {
	const router = useRouter();

	return (
		<main className="flex grow items-center justify-center px-6 py-12">
			<article className="flex w-full max-w-2xl flex-col items-center text-center">
				<figure className="group relative mb-8">
					<span className="absolute inset-0 rounded-full bg-primary/20 blur-[60px]" />
					<figcaption className="glow-effect relative rounded-2xl border border-border/50 bg-card/50 p-8">
						<img
							className="size-20 opacity-90"
							alt="Lynx logo"
							src="/vite.svg"
						/>
					</figcaption>
				</figure>

				<header className="mb-10 space-y-4">
					<h1 className="text-5xl font-bold tracking-tighter text-white lg:text-7xl">
						404
					</h1>
					<h2 className="text-2xl font-semibold text-slate-200 lg:text-3xl">
						Page Not Found
					</h2>
					<p className="mx-auto max-w-md text-lg leading-relaxed text-slate-400">
						It looks like this path was missed by the scan. The resource you're
						looking for might have been moved or deleted.
					</p>
					<code className="mt-4 inline-block rounded border border-border bg-card px-4 py-2 font-mono text-sm text-primary">
						console.error("error_code: 404_PATH_NOT_FOUND");
					</code>
				</header>

				<nav className="flex flex-col items-center gap-4 sm:flex-row">
					<Link
						to={ROUTES.DASHBOARD}
						className="inline-flex min-w-50 items-center justify-center rounded-lg bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
					>
						Return to Dashboard
					</Link>
					<button
						type="button"
						onClick={() => router.history.back()}
						className="inline-flex min-w-50 items-center justify-center rounded-lg border bg-card px-8 py-3 font-bold text-slate-300 transition-all hover:bg-card/80"
					>
						Go Back
					</button>
				</nav>
			</article>
		</main>
	);
}
