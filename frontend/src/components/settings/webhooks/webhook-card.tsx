import { Check, Copy, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";

interface WebhookCardProps {
	platform: string;
	icon: LucideIcon;
	url: string;
	setupSteps: string[];
	eventTypes: string[];
}

export function WebhookCard({
	platform,
	icon: Icon,
	url,
	setupSteps,
	eventTypes,
}: WebhookCardProps) {
	const [copiedText, copy] = useClipboard();

	const handleCopy = () => {
		copy(url);
	};

	return (
		<article className="border border-border rounded-xl p-6 bg-card">
			<div className="flex items-center gap-3 mb-4">
				<Icon className="size-6 text-primary" />
				<h3 className="text-lg font-bold">{platform}</h3>
			</div>

			<div className="mb-4">
				<label className="text-sm font-semibold text-muted-foreground mb-2 block">
					Webhook URL
				</label>
				<div className="flex gap-2">
					<code className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono overflow-x-auto">
						{url}
					</code>
					<Button
						variant="outline"
						size="sm"
						onClick={handleCopy}
						className="shrink-0"
					>
						{copiedText ? (
							<Check className="size-4 text-success" />
						) : (
							<Copy className="size-4" />
						)}
					</Button>
				</div>
			</div>

			<div className="mb-4">
				<h4 className="text-sm font-semibold text-muted-foreground mb-2">
					Setup Steps
				</h4>
				<ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
					{setupSteps.map((step, index) => (
						<li key={index}>{step}</li>
					))}
				</ol>
			</div>

			<div>
				<h4 className="text-sm font-semibold text-muted-foreground mb-2">
					Triggered Events
				</h4>
				<ul className="space-y-1">
					{eventTypes.map((event, index) => (
						<li
							key={index}
							className="text-sm text-muted-foreground flex items-center gap-2"
						>
							<span className="size-1.5 rounded-full bg-primary" />
							{event}
						</li>
					))}
				</ul>
			</div>
		</article>
	);
}
