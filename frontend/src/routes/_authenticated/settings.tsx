import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { ProviderCard } from "@/components/cards/llm-provider";
import {
  type Provider,
  useCurrentApiKeys,
  useSupportedModels,
} from "@/hooks/use-api-keys";

export const Route = createFileRoute("/_authenticated/settings")({
  component: RouteComponent,
});

interface ProviderConfig {
  name: string;
  provider: Provider;
  logo: string;
}

const PROVIDER_INFO: ProviderConfig[] = [
  {
    name: "OpenAI",
    provider: "openai",
    logo: "/openai-logo.png",
  },
  {
    name: "Anthropic",
    provider: "anthropic",
    logo: "/anthropic-logo.webp",
  },
  {
    name: "Google Gemini",
    provider: "gemini",
    logo: "/gemini-logo.png",
  },
];

function RouteComponent() {
  const { data: supportedModels, isLoading: modelsLoading } =
    useSupportedModels();
  const { data: currentApiKeys, isLoading: keysLoading } = useCurrentApiKeys();

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">API Configuration</h1>
        <p className="text-muted-foreground max-w-2xl mt-2">
          Connect your preferred LLM providers to power your AI features. All
          keys are encrypted and stored securely.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {PROVIDER_INFO.map((provider) => {
          const existingKey = currentApiKeys?.find(
            (key) => key.provider === provider.provider,
          );
          const models =
            supportedModels?.find((p) => p.provider === provider.provider)
              ?.models || [];

          return (
            <ProviderCard
              key={provider.provider}
              name={provider.name}
              provider={provider.provider}
              logo={provider.logo}
              models={models}
              existingKey={existingKey}
              isLoadingModels={modelsLoading}
              isLoadingKeys={keysLoading}
            />
          );
        })}
      </div>

      <div className="mt-8 border border-primary/20 bg-primary/5 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Shield className="size-6 text-primary shrink-0" />
          <div>
            <h4 className="font-bold mb-1">Security Information</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lynx takes your security seriously. Your API keys are encrypted
              before storage. We never log full keys in our telemetry, and they
              are only accessed during the request cycle to the respective LLM
              providers.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
