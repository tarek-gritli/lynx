import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CreateTemplateRequest, Template } from "@/hooks/use-templates";
import { useCreateTemplate, useUpdateTemplate } from "@/hooks/use-templates";

interface TemplateEditorProps {
	template?: Template;
	onSave: () => void;
	onCancel: () => void;
}

export function TemplateEditor({
	template,
	onSave,
	onCancel,
}: TemplateEditorProps) {
	const [name, setName] = useState(template?.name || "");
	const [content, setContent] = useState(template?.content || "");
	const [error, setError] = useState("");

	const createTemplate = useCreateTemplate();
	const updateTemplate = useUpdateTemplate();

	const handleSave = async () => {
		setError("");

		if (!name.trim()) {
			setError("Template name is required");
			return;
		}

		if (!content.trim()) {
			setError("Template content is required");
			return;
		}

		if (!content.includes("{diff}")) {
			setError("Template must include {diff} placeholder");
			return;
		}

		try {
			if (template?.id) {
				await updateTemplate.mutateAsync({
					id: template.id,
					data: { name, content },
				});
			} else {
				const data: CreateTemplateRequest = { name, content };
				await createTemplate.mutateAsync(data);
			}
			onSave();
		} catch (err: unknown) {
			const error = err as { response?: { data?: { detail?: string } } };
			setError(error.response?.data?.detail || "Failed to save template");
		}
	};

	return (
		<article className="border border-border rounded-xl p-6 bg-card mb-4">
			<h4 className="font-bold mb-4">
				{template ? "Edit Template" : "Create New Template"}
			</h4>

			<div className="space-y-4">
				<div>
					<label className="text-sm font-semibold text-muted-foreground mb-2 block">
						Template Name
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
						placeholder="e.g., Security Focused Review"
					/>
				</div>

				<div>
					<label className="text-sm font-semibold text-muted-foreground mb-2 block">
						Template Content
					</label>
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={12}
						className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono"
						placeholder="Enter your template here. Must include {diff} placeholder."
					/>
				</div>

				{error && <p className="text-sm text-destructive">{error}</p>}

				<div className="flex items-center gap-2">
					<Button
						onClick={handleSave}
						disabled={createTemplate.isPending || updateTemplate.isPending}
					>
						{createTemplate.isPending || updateTemplate.isPending
							? "Saving..."
							: "Save Template"}
					</Button>
					<Button variant="outline" onClick={onCancel}>
						Cancel
					</Button>
				</div>
			</div>
		</article>
	);
}
