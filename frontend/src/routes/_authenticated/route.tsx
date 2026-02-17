import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({ context: { auth } }) => {
    if (!auth.isLoading && !auth.user) {
      throw redirect({ to: "/landing" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
