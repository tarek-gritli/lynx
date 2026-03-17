import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { API_URL } from "@/lib/constants";

export interface Notification {
	id: number;
	type: "review_success" | "review_failed";
	review_id: number;
	repo_name: string;
	pr_number: number;
	provider: string;
	error: string | null;
	read: boolean;
	created_at: string;
}

export function useNotifications(userId: string | undefined) {
	const queryClient = useQueryClient();
	const eventSourceRef = useRef<EventSource | null>(null);

	const { data: notifications = [] } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => api.get<Notification[]>("/notifications"),
		enabled: !!userId,
	});

	const unreadCount = notifications.filter((n) => !n.read).length;

	const { mutateAsync: markAsRead } = useMutation({
		mutationFn: (id: number) => api.patch(`/notifications/${id}/read`, null),
		meta: { invalidates: [["notifications"]] },
	});

	const { mutateAsync: markAllAsRead } = useMutation({
		mutationFn: () => api.patch("/notifications/read-all", null),
		meta: { invalidates: [["notifications"]] },
	});

	useEffect(() => {
		if (!userId) return;

		const url = `${API_URL}/notifications/stream`;
		const es = new EventSource(url, { withCredentials: true });
		eventSourceRef.current = es;

		function handleEvent() {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["reviews"] });
			queryClient.invalidateQueries({ queryKey: ["stats"] });
		}

		es.addEventListener("review_success", handleEvent);
		es.addEventListener("review_failed", handleEvent);

		return () => {
			es.close();
			eventSourceRef.current = null;
		};
	}, [userId, queryClient]);

	return { notifications, unreadCount, markAsRead, markAllAsRead };
}
