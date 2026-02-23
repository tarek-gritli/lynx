import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/lib/navigation";

export const Route = createFileRoute("/_unauthenticated")({
  component: () => <Outlet />,
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.isLoading && auth.user) {
      throw redirect({ to: ROUTES.DASHBOARD });
    }
  },
});
