import { Github, Gitlab, Info, type LucideIcon } from "lucide-react";
import { API_URL } from "@/lib/constants";
import { WebhookCard } from "./webhook-card";

interface WebhookConfig {
  platform: "GitHub" | "GitLab";
  icon: LucideIcon;
  url: string;
  setupSteps: string[];
  eventTypes: string[];
}

const WEBHOOK_CONFIGS: WebhookConfig[] = [
  {
    platform: "GitHub",
    icon: Github,
    url: `${API_URL}/webhooks/github`,
    setupSteps: [
      "Go to your repository Settings → Webhooks → Add webhook",
      "Paste the webhook URL below",
      "Set Content type to 'application/json'",
      "Select 'Let me select individual events'",
      "Enable: Pull requests, Issue comments",
      "Click 'Add webhook'",
    ],
    eventTypes: [
      "pull_request (opened)",
      "issue_comment (created with /review)",
    ],
  },
  {
    platform: "GitLab",
    icon: Gitlab,
    url: `${API_URL}/webhooks/gitlab`,
    setupSteps: [
      "Go to your project Settings → Webhooks",
      "Paste the webhook URL below",
      "Add your webhook secret token (configured in backend)",
      "Enable triggers: Merge request events, Comments",
      "Click 'Add webhook'",
    ],
    eventTypes: ["merge_request (open)", "note (with /review comment)"],
  },
];

export function WebhookConfiguration() {
  return (
    <section className="mt-12">
      <header className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Webhook Configuration</h2>
        <p className="text-muted-foreground mt-2">
          Configure webhooks to automatically trigger reviews when pull requests
          are opened or when you comment /review on a PR.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {WEBHOOK_CONFIGS.map((config) => (
          <WebhookCard
            key={config.platform}
            platform={config.platform}
            icon={config.icon}
            url={config.url}
            setupSteps={config.setupSteps}
            eventTypes={config.eventTypes}
          />
        ))}
      </div>

      <div className="mt-6 border border-info/20 bg-info/5 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Info className="size-6 text-info shrink-0" />
          <div>
            <h4 className="font-bold mb-1">Webhook Security</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Webhooks are secured with signature verification (GitHub) and
              secret tokens (GitLab). Make sure your backend environment
              variables are properly configured with the webhook secrets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
