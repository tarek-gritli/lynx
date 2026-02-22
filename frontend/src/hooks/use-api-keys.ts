import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export type Provider = "openai" | "anthropic" | "gemini";

interface SetApiKeyRequest {
  provider: Provider;
  model: string;
  api_key: string;
}

interface DeleteApiKeyRequest {
  provider: Provider;
}

interface ToggleApiKeyRequest {
  provider: Provider;
  is_active: boolean;
}

interface ToggleApiKeyResponse {
  status: string;
  is_active: boolean;
}

interface BulkSetApiKeysRequest {
  api_keys: SetApiKeyRequest[];
}

interface ProviderModels {
  provider: Provider;
  models: string[];
}

interface ApiKeyInfo {
  provider: Provider;
  model: string;
  is_active: boolean;
}

interface BulkSetApiKeysError {
  provider: Provider;
  error: string;
}

interface BulkSetApiKeysResult {
  provider: Provider;
  status: string;
}

interface BulkSetApiKeysResponse {
  status: string;
  successful: number;
  failed: number;
  results: BulkSetApiKeysResult[];
  errors: BulkSetApiKeysError[];
}

export function useApiKeys() {
  const queryClient = useQueryClient();

  const setApiKeyMutation = useMutation({
    mutationFn: (data: SetApiKeyRequest) => api.post("/settings/api-key", data),
    onSuccess: () => {
      toast.success("API key saved and validated successfully");
      queryClient.invalidateQueries({ queryKey: ["current-api-keys"] });
    },
    onError: () => {
      toast.error("Failed to save API key");
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: (data: DeleteApiKeyRequest) =>
      api.delete("/settings/api-key", data),
    onSuccess: () => {
      toast.success("API key deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["current-api-keys"] });
    },
    onError: () => {
      toast.error("Failed to delete API key");
    },
  });

  const toggleApiKeyMutation = useMutation({
    mutationFn: (data: ToggleApiKeyRequest) =>
      api.patch<ToggleApiKeyResponse>("/settings/api-key/toggle", data),
    onSuccess: (response: ToggleApiKeyResponse) => {
      toast.success(
        `API key ${response.is_active ? "activated" : "deactivated"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["current-api-keys"] });
    },
    onError: () => {
      toast.error("Failed to toggle API key");
    },
  });

  const bulkSetApiKeysMutation = useMutation({
    mutationFn: (data: BulkSetApiKeysRequest) =>
      api.post<BulkSetApiKeysResponse>("/settings/api-keys/bulk", data),
    onSuccess: (response: BulkSetApiKeysResponse) => {
      if (response.successful > 0) {
        toast.success(`${response.successful} API key(s) saved successfully`);
        queryClient.invalidateQueries({ queryKey: ["current-api-keys"] });
      }
      if (response.failed > 0) {
        response.errors.forEach((error: BulkSetApiKeysError) => {
          console.log("Bulk set API keys error:", error);
          toast.error(`${error.provider}: ${error.error}`);
        });
      }
    },
    onError: () => {
      toast.error("Failed to save API keys");
    },
  });

  return {
    setApiKey: setApiKeyMutation.mutate,
    deleteApiKey: deleteApiKeyMutation.mutate,
    toggleApiKey: toggleApiKeyMutation.mutate,
    bulkSetApiKeys: bulkSetApiKeysMutation.mutate,
    isSaving: setApiKeyMutation.isPending,
    isDeleting: deleteApiKeyMutation.isPending,
    isToggling: toggleApiKeyMutation.isPending,
    isBulkSaving: bulkSetApiKeysMutation.isPending,
  };
}

export function useSupportedModels() {
  return useQuery<ProviderModels[]>({
    queryKey: ["supported-models"],
    queryFn: () => api.get("/settings/models"),
  });
}

export function useCurrentApiKeys() {
  return useQuery<ApiKeyInfo[]>({
    queryKey: ["current-api-keys"],
    queryFn: () => api.get("/settings/api-keys"),
  });
}
