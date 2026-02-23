import { Info, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Template } from "@/hooks/use-templates";
import { useDefaultTemplate, useTemplates } from "@/hooks/use-templates";
import { DefaultTemplateCard } from "./default-template-card";
import { DefaultTemplateSkeleton } from "./default-template-skeleton";
import { ResetDefaultButton } from "./reset-default-button";
import { TemplateCard } from "./template-card";
import { TemplateEditor } from "./template-editor";
import { TemplateSkeleton } from "./template-skeleton";

export function TemplateConfiguration() {
	const { templates, isLoading: templatesLoading } = useTemplates();
	const { data: defaultTemplate, isLoading: defaultLoading } =
		useDefaultTemplate();
	const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
	const [isCreating, setIsCreating] = useState(false);

	return (
		<section>
			<header className="mb-6">
				<h2 className="text-xl md:text-2xl font-bold">
					Review Template Customization
				</h2>
				<p className="text-muted-foreground mt-2">
					Customize the AI review prompt to match your team's standards and
					focus areas.
				</p>
			</header>

			<div className="border border-info/20 bg-info/5 rounded-lg p-6 mb-6">
				<div className="flex items-start gap-4">
					<Info className="size-6 text-info shrink-0" />
					<div>
						<h4 className="font-bold mb-1">Template Requirements</h4>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Templates must include the{" "}
							<code className="bg-background px-1.5 py-0.5 rounded text-xs">
								{"{diff}"}
							</code>{" "}
							placeholder where the PR diff will be inserted. The default
							template focuses on critical bugs, security vulnerabilities, and
							performance issues.
						</p>
					</div>
				</div>
			</div>

			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">Current Default Template</h3>
					{!defaultLoading && defaultTemplate?.id && <ResetDefaultButton />}
				</div>
				{defaultLoading ? (
					<DefaultTemplateSkeleton />
				) : (
					defaultTemplate && <DefaultTemplateCard template={defaultTemplate} />
				)}
			</div>

			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold">Your Templates</h3>
				<Button
					onClick={() => setIsCreating(true)}
					size="sm"
					className="flex items-center gap-2"
				>
					<Plus className="size-4" />
					New Template
				</Button>
			</div>

			{isCreating && (
				<TemplateEditor
					onSave={() => setIsCreating(false)}
					onCancel={() => setIsCreating(false)}
				/>
			)}

			{editingTemplate && (
				<TemplateEditor
					template={editingTemplate}
					onSave={() => setEditingTemplate(null)}
					onCancel={() => setEditingTemplate(null)}
				/>
			)}

			<div className="grid grid-cols-1 gap-4">
				{templatesLoading ? (
					<>
						<TemplateSkeleton />
						<TemplateSkeleton />
						<TemplateSkeleton />
					</>
				) : templates && templates.length > 0 ? (
					templates.map((template) => (
						<TemplateCard
							key={template.id}
							template={template}
							onEdit={setEditingTemplate}
						/>
					))
				) : (
					<p className="text-muted-foreground text-sm">
						No custom templates yet. Create one to get started.
					</p>
				)}
			</div>
		</section>
	);
}
