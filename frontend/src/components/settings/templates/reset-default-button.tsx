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
import { useResetToSystemDefault } from "@/hooks/use-templates";

export function ResetDefaultButton() {
	const [isOpen, setIsOpen] = useState(false);
	const resetDefault = useResetToSystemDefault();

	const handleReset = () => {
		resetDefault.mutate(undefined, {
			onSuccess: () => {
				setIsOpen(false);
			},
		});
	};

	return (
		<>
			<Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
				Reset to System Default
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reset to System Default?</DialogTitle>
						<DialogDescription>
							This will remove your custom default template and use the system
							default template for all future reviews. Your custom templates
							will not be deleted.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsOpen(false)}
							disabled={resetDefault.isPending}
						>
							Cancel
						</Button>
						<Button onClick={handleReset} disabled={resetDefault.isPending}>
							{resetDefault.isPending ? "Resetting..." : "Reset to Default"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
