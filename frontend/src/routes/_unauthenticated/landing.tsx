import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_unauthenticated/landing")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Welcome to Lynx</h1>
    </main>
  );
}
