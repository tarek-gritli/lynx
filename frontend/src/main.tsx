import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import toast, { Toaster } from "react-hot-toast";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });
const queryClient = new QueryClient();
const notify = () => toast("Here is your toast.");

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <button type="button" onClick={notify}>
        Notify
      </button>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
