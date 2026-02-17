import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/lib/navigation";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.isLoading && auth.user) {
      throw redirect({ to: ROUTES.DASHBOARD });
    }
    throw redirect({ to: ROUTES.LANDING });
  },
});
