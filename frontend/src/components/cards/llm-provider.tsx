import { Eye, EyeOff, Save, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { type Provider, useApiKeys } from "@/hooks/use-api-keys";

interface ProviderCardProps {
  name: string;
  provider: Provider;
  logo: string;
  models: string[];
  existingKey?: {
    model: string;
    is_active: boolean;
  };
  isLoadingKeys?: boolean;
  isLoadingModels?: boolean;
}

export function ProviderCard({
  name,
  provider,
  logo,
  models,
  existingKey,
  isLoadingKeys,
  isLoadingModels,
}: ProviderCardProps) {
  const { setApiKey, deleteApiKey, toggleApiKey } = useApiKeys();

  const [apiKey, setApiKeyValue] = useState("");
  const [model, setModel] = useState(existingKey?.model ?? models[0] ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = () => {
    if (!apiKey) return;

    setIsSaving(true);
    setApiKey(
      {
        provider,
        model,
        api_key: apiKey,
      },
      {
        onSuccess: () => {
          setApiKeyValue("");
          setIsSaving(false);
        },
        onError: () => {
          setIsSaving(false);
        },
      },
    );
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteApiKey(
      { provider },
      {
        onSuccess: () => {
          setApiKeyValue("");
          setModel(models[0] ?? "");
          setIsDeleting(false);
        },
        onError: () => {
          setIsDeleting(false);
        },
      },
    );
  };

  const handleToggleActive = (isActive: boolean) => {
    toggleApiKey({
      provider,
      is_active: isActive,
    });
  };

  return (
    <div className="border border-border rounded-lg hover:border-primary/50 transition-all">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              alt={`${name} Logo`}
              className="size-8 p-1 rounded-lg bg-white"
              src={logo}
            />
            <div className="flex flex-col justify-center">
              <h3 className="text-sm md:text-xl font-bold">{name}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Configure your {name} API key and default model
              </p>
            </div>
          </div>
          {isLoadingKeys ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            existingKey && (
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`${provider}-active`}
                  className="hidden md:block text-sm text-muted-foreground"
                >
                  Active
                </Label>
                <Switch
                  id={`${provider}-active`}
                  checked={existingKey.is_active}
                  onCheckedChange={handleToggleActive}
                />
              </div>
            )
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor={`${provider}-key`}>API Key</Label>
            <div className="relative group">
              <Input
                id={`${provider}-key`}
                className="pr-10"
                placeholder={`Enter ${name} API Key`}
                type={showPassword ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKeyValue(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${provider}-model`}>Default Model</Label>
            {isLoadingModels ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={model}
                onValueChange={setModel}
                disabled={models.length === 0}
              >
                <SelectTrigger id={`${provider}-model`}>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!apiKey || isSaving}>
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
