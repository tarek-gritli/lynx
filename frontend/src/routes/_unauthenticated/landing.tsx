import { createFileRoute } from "@tanstack/react-router";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { TerminalDemo } from "@/components/landing/terminal-demo";
import { TrustedBy } from "@/components/landing/trusted-by";

export const Route = createFileRoute("/_unauthenticated/landing")({
	component: LandingPage,
});

function LandingPage() {
	return (
		<>
			<main className="flex-1 pt-24 pb-20">
				<div className="mx-auto max-w-300 px-6">
					<Hero />
					<Features />
					<TerminalDemo />
					<TrustedBy />
				</div>
			</main>
			<Footer />
		</>
	);
}
