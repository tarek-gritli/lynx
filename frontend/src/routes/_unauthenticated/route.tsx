import { ROUTES } from "@/lib/navigation";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_unauthenticated")({
  component: () => <Outlet />,
  beforeLoad: ({ context: { auth } }) => {
    if (auth?.user) {
      throw redirect({ to: ROUTES.DASHBOARD });
    }
  },
});
