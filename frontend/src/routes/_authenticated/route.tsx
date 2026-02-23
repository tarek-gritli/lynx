import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AppSidebar from "@/components/navigation/app-sidebar";
import MobileNavbar from "@/components/navigation/mobile-nav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/navigation";

export const Route = createFileRoute("/_authenticated")({
	component: RouteComponent,
	beforeLoad: async ({ context: { auth } }) => {
		if (!auth.isLoading && !auth.user) {
			throw redirect({ to: ROUTES.LANDING });
		}
	},
});

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="flex-1 overflow-auto">
				<MobileNavbar />
				<div className="p-6">
					<Outlet />
				</div>
			</main>
		</SidebarProvider>
	);
}
