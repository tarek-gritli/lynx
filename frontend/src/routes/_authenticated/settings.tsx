import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Key, ScrollText, Webhook } from "lucide-react";
import { ApiConfiguration } from "@/components/settings/api-configuration";
import { TemplateConfiguration } from "@/components/settings/templates/template-configuration";
import { WebhookConfiguration } from "@/components/settings/webhooks/webhook-configuration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabValue = "api" | "templates" | "webhooks";

interface SettingsSearch {
	tab?: TabValue;
}

export const Route = createFileRoute("/_authenticated/settings")({
	validateSearch: (search: Record<string, unknown>): SettingsSearch => {
		return {
			tab: (search.tab as TabValue) || "api",
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { tab } = Route.useSearch();

	const handleTabChange = (value: string) => {
		navigate({
			search: { tab: value as TabValue },
		});
	};

	return (
		<main className="flex-1 overflow-y-auto p-4 md:p-8">
			<header className="mb-8">
				<h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
				<p className="text-muted-foreground max-w-2xl mt-2">
					Manage your API keys, customize review templates, and configure
					webhooks.
				</p>
			</header>

			<Tabs value={tab} onValueChange={handleTabChange} className="w-full">
				<div className="w-full overflow-x-auto mb-4">
					<TabsList className="w-full sm:w-fit">
						<TabsTrigger value="api" className="gap-2 flex-1 sm:flex-initial">
							<Key className="size-4" />
							<span className="hidden xs:inline sm:inline">API Keys</span>
							<span className="inline xs:hidden sm:hidden">API</span>
						</TabsTrigger>
						<TabsTrigger
							value="templates"
							className="gap-2 flex-1 sm:flex-initial"
						>
							<ScrollText className="size-4" />
							<span className="hidden xs:inline sm:inline">Templates</span>
							<span className="inline xs:hidden sm:hidden">Tmpl</span>
						</TabsTrigger>
						<TabsTrigger
							value="webhooks"
							className="gap-2 flex-1 sm:flex-initial"
						>
							<Webhook className="size-4" />
							<span className="hidden xs:inline sm:inline">Webhooks</span>
							<span className="inline xs:hidden sm:hidden">Hook</span>
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="api">
					<ApiConfiguration />
				</TabsContent>

				<TabsContent value="templates">
					<TemplateConfiguration />
				</TabsContent>

				<TabsContent value="webhooks">
					<WebhookConfiguration />
				</TabsContent>
			</Tabs>
		</main>
	);
}
