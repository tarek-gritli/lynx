import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context: { auth } }) => {
    if (auth.user) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/landing" });
  },
});
