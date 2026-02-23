import { createFileRoute } from "@tanstack/react-router";
import { Key, ScrollText, Webhook } from "lucide-react";
import { ApiConfiguration } from "@/components/settings/api-configuration";
import { TemplateConfiguration } from "@/components/settings/templates/template-configuration";
import { WebhookConfiguration } from "@/components/settings/webhooks/webhook-configuration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="flex-1 overflow-y-auto p-4 md:p-8">
			<header className="mb-8">
				<h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
				<p className="text-muted-foreground max-w-2xl mt-2">
					Manage your API keys, customize review templates, and configure
					webhooks.
				</p>
			</header>

			<Tabs defaultValue="api" className="w-full">
				<TabsList className="mb-6">
					<TabsTrigger value="api" className="gap-2">
						<Key className="size-4" />
						API Keys
					</TabsTrigger>
					<TabsTrigger value="templates" className="gap-2">
						<ScrollText className="size-4" />
						Templates
					</TabsTrigger>
					<TabsTrigger value="webhooks" className="gap-2">
						<Webhook className="size-4" />
						Webhooks
					</TabsTrigger>
				</TabsList>

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
