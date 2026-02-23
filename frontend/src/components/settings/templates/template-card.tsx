import { Edit, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Template } from "@/hooks/use-templates";
import {
	useDeleteTemplate,
	useSetDefaultTemplate,
} from "@/hooks/use-templates";

interface TemplateCardProps {
	template: Template;
	onEdit: (template: Template) => void;
}

export function TemplateCard({ template, onEdit }: TemplateCardProps) {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const setDefault = useSetDefaultTemplate();
	const deleteTemplate = useDeleteTemplate();

	const handleSetDefault = () => {
		if (template.id) {
			setDefault.mutate(template.id);
		}
	};

	const handleDelete = () => {
		if (template.id) {
			deleteTemplate.mutate(template.id, {
				onSuccess: () => {
					setIsDeleteDialogOpen(false);
				},
			});
		}
	};

	return (
		<article className="border border-border rounded-xl p-6 bg-card">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<h4 className="font-bold">{template.name}</h4>
					{template.is_default && (
						<span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
							Default
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{!template.is_default && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleSetDefault}
							disabled={setDefault.isPending}
							className="flex items-center gap-2"
						>
							<Star className="size-4" />
							Set Default
						</Button>
					)}
					<Button variant="outline" size="sm" onClick={() => onEdit(template)}>
						<Edit className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsDeleteDialogOpen(true)}
						disabled={deleteTemplate.isPending}
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			</div>
			<pre className="bg-background border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
				{template.content}
			</pre>
			{template.updated_at && (
				<p className="text-xs text-muted-foreground mt-2">
					Last updated: {new Date(template.updated_at).toLocaleDateString()}
				</p>
			)}

			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Template?</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{template.name}"? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
							disabled={deleteTemplate.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={deleteTemplate.isPending}
						>
							{deleteTemplate.isPending ? "Deleting..." : "Delete Template"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</article>
	);
}
