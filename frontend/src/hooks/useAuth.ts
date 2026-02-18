import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, api } from "../lib/api";

export interface User {
  id: string;
  github_id: number;
  github_username: string;
  github_image_url: string;
  gitlab_id: number;
  gitlab_username: string;
  gitlab_image_url: string;
  email: string;
}

export interface AuthState {
  user: User | null | undefined;
  isLoading: boolean;
}

async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await api.get<User>("/auth/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

async function logout(): Promise<void> {
  try {
    return await api.post("/auth/logout", {});
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return;
    throw error;
  }
}

export function useAuth(): AuthState & { logout: () => void } {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  return { user, isLoading, logout: logoutMutation.mutate };
}
