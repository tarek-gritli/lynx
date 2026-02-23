import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useSupportedModels } from "@/hooks/use-api-keys";
import type { ReviewFilters } from "@/hooks/use-reviews";

interface MoreFiltersSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	filters: Partial<ReviewFilters>;
	onApplyFilters: (filters: Partial<ReviewFilters>) => void;
}

const PROVIDERS = [
	{ value: "openai", label: "OpenAI" },
	{ value: "anthropic", label: "Anthropic" },
	{ value: "gemini", label: "Google Gemini" },
];

export function MoreFiltersSheet({
	open,
	onOpenChange,
	filters,
	onApplyFilters,
}: MoreFiltersSheetProps) {
	const [localFilters, setLocalFilters] =
		useState<Partial<ReviewFilters>>(filters);
	const { data: supportedModels, isLoading: modelsLoading } =
		useSupportedModels();

	const allModels = useMemo(() => {
		if (!supportedModels) return [];
		const models = supportedModels.flatMap((provider) => provider.models);
		return [...new Set(models)].sort(); // Remove duplicates and sort
	}, [supportedModels]);

	const handleApply = () => {
		onApplyFilters(localFilters);
		onOpenChange(false);
	};

	const handleReset = () => {
		const resetFilters: Partial<ReviewFilters> = {
			provider: undefined,
			model: undefined,
			start_date: undefined,
			end_date: undefined,
		};
		setLocalFilters(resetFilters);
		onApplyFilters(resetFilters);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-md">
				<SheetHeader className="space-y-2 sm:space-y-3 pb-4">
					<SheetTitle className="text-lg sm:text-xl">
						Advanced Filters
					</SheetTitle>
					<SheetDescription className="text-sm sm:text-base">
						Refine your search with additional criteria
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-6 sm:gap-8 max-h-[calc(100vh-200px)] p-4">
					<div className="space-y-2.5">
						<Label
							htmlFor="provider"
							className="text-xs sm:text-sm font-semibold"
						>
							Provider
						</Label>
						<Select
							value={localFilters.provider || "all"}
							onValueChange={(value) =>
								setLocalFilters((prev) => ({
									...prev,
									provider: value === "all" ? undefined : value,
								}))
							}
						>
							<SelectTrigger id="provider" className="h-10 sm:h-11">
								<SelectValue placeholder="All providers" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All providers</SelectItem>
								{PROVIDERS.map((provider) => (
									<SelectItem key={provider.value} value={provider.value}>
										{provider.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2.5">
						<Label htmlFor="model" className="text-xs sm:text-sm font-semibold">
							Model
						</Label>
						<Select
							value={localFilters.model || "all"}
							onValueChange={(value) =>
								setLocalFilters((prev) => ({
									...prev,
									model: value === "all" ? undefined : value,
								}))
							}
							disabled={modelsLoading}
						>
							<SelectTrigger id="model" className="h-10 sm:h-11">
								<SelectValue
									placeholder={
										modelsLoading ? "Loading models..." : "All models"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All models</SelectItem>
								{allModels.map((model) => (
									<SelectItem key={model} value={model}>
										{model}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-4 sm:space-y-5">
						<div className="space-y-2.5">
							<Label
								htmlFor="start-date"
								className="text-xs sm:text-sm font-semibold"
							>
								Start Date
							</Label>
							<div className="relative">
								<Input
									id="start-date"
									type="date"
									value={localFilters.start_date || ""}
									onChange={(e) =>
										setLocalFilters((prev) => ({
											...prev,
											start_date: e.target.value || undefined,
										}))
									}
									className="pr-10 h-10 sm:h-11"
								/>
								<CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
							</div>
						</div>

						<div className="space-y-2.5">
							<Label
								htmlFor="end-date"
								className="text-xs sm:text-sm font-semibold"
							>
								End Date
							</Label>
							<div className="relative">
								<Input
									id="end-date"
									type="date"
									value={localFilters.end_date || ""}
									onChange={(e) =>
										setLocalFilters((prev) => ({
											...prev,
											end_date: e.target.value || undefined,
										}))
									}
									className="pr-10 h-10 sm:h-11"
								/>
								<CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
							</div>
						</div>
					</div>
				</div>

				<SheetFooter className="flex flex-col sm:flex-row gap-3 pt-6 mt-auto">
					<Button
						variant="outline"
						onClick={handleReset}
						className="w-full sm:flex-1"
						size="default"
					>
						Reset
					</Button>
					<SheetClose asChild>
						<Button
							onClick={handleApply}
							className="w-full sm:flex-1"
							size="default"
						>
							Apply Filters
						</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
