import { useLocation } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useSidebar } from "./ui/sidebar";

export default function MobileNavbar() {
  const location = useLocation();
  const { toggleSidebar } = useSidebar();
  const path = location.pathname.split("/")[1] || "dashboard";
  const page = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b px-4 md:hidden">
      <button
        type="button"
        onClick={toggleSidebar}
        className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-primary/10"
      >
        <Menu className="size-5" />
        <span className="sr-only">Toggle menu</span>
      </button>
      <span className="font-semibold">{page}</span>
    </header>
  );
}
