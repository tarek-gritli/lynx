import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiError, api } from "@/lib/api";

export interface Template {
	id: number | null;
	name: string;
	content: string;
	is_default: boolean;
	created_at: string | null;
	updated_at: string | null;
}

export interface CreateTemplateRequest {
	name: string;
	content: string;
}

export interface UpdateTemplateRequest {
	name?: string;
	content?: string;
}

export function useTemplates() {
	const {
		data: templates,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["templates"],
		queryFn: () => api.get<Template[]>("/templates/templates"),
		refetchInterval: 60 * 1000,
		retry(failureCount, error) {
			if (error instanceof ApiError && "status" in error && error.status < 500)
				return false;
			return failureCount < 3;
		},
	});

	return { templates, isLoading, isError, error };
}

export function useDefaultTemplate() {
	return useQuery({
		queryKey: ["templates", "default"],
		queryFn: () => api.get<Template>("/templates/templates/default"),
	});
}

export function useCreateTemplate() {
	return useMutation({
		mutationFn: (data: CreateTemplateRequest) =>
			api.post<Template>("/templates/templates", data),
		meta: {
			invalidates: [["templates"]],
		},
	});
}

export function useUpdateTemplate() {
	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateTemplateRequest }) =>
			api.patch<Template>(`/templates/templates/${id}`, data),
		meta: {
			invalidates: [["templates"]],
		},
	});
}

export function useDeleteTemplate() {
	return useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/templates/templates/${id}`);
		},
		meta: {
			invalidates: [["templates"]],
		},
	});
}

export function useSetDefaultTemplate() {
	return useMutation({
		mutationFn: async (templateId: number) => {
			await api.post("/templates/templates/set-default", {
				template_id: templateId,
			});
		},
		meta: {
			invalidates: [["templates"], ["templates", "default"]],
		},
	});
}

export function useResetToSystemDefault() {
	return useMutation({
		mutationFn: () => api.post("/templates/templates/reset-default", {}),
		meta: {
			invalidates: [["templates"], ["templates", "default"]],
		},
	});
}
