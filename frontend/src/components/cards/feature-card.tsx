import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

export function FeatureCard({
	icon: Icon,
	title,
	description,
}: FeatureCardProps) {
	return (
		<article className="group flex flex-col gap-4 rounded-xl border border-border bg-card/20 p-8 hover:border-primary/50 hover:bg-primary/5 transition-all">
			<Icon className="size-12 p-3 rounded-lg bg-primary/10 text-primary" />
			<h2 className="text-xl font-bold mb-2">{title}</h2>
			<p className="text-muted-foreground leading-relaxed">{description}</p>
		</article>
	);
}
