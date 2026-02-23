import { Check, Copy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";
import type { Template } from "@/hooks/use-templates";

interface DefaultTemplateCardProps {
	template: Template;
}

export function DefaultTemplateCard({ template }: DefaultTemplateCardProps) {
	const [copiedText, copy] = useClipboard();

	const handleCopy = () => {
		copy(template.content);
	};

	return (
		<article className="border border-primary/30 bg-card rounded-xl p-6">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Star className="size-5 text-primary fill-primary" />
					<h4 className="font-bold">{template.name}</h4>
				</div>
				<Button variant="outline" size="sm" onClick={handleCopy}>
					{copiedText ? (
						<Check className="size-4 text-success" />
					) : (
						<Copy className="size-4" />
					)}
				</Button>
			</div>
			<pre className="bg-background border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
				{template.content}
			</pre>
		</article>
	);
}
