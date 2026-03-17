import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AppSidebar from "@/components/navigation/app-sidebar";
import MobileNavbar from "@/components/navigation/mobile-nav";
import { NotificationBell } from "@/components/navigation/notification-panel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
	component: RouteComponent,
	beforeLoad: async ({ context: { auth } }) => {
		if (!auth.isLoading && !auth.user) {
			throw redirect({ to: ROUTES.LANDING });
		}
	},
});

function RouteComponent() {
	const { user } = useAuth();
	const notificationProps = useNotifications(user?.id);

	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="flex-1 overflow-auto">
				<div className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
					<MobileNavbar />
					<div className="ml-auto">
						<NotificationBell {...notificationProps} />
					</div>
				</div>
				<div className="p-6">
					<Outlet />
				</div>
			</main>
		</SidebarProvider>
	);
}
