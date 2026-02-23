import { Github, Gitlab } from "lucide-react";
import { API_URL } from "@/lib/constants";

export function Hero() {
  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/auth/github`;
  };

  const handleGitlabLogin = () => {
    window.location.href = `${API_URL}/auth/gitlab`;
  };

  return (
    <header className="flex flex-col items-center justify-center text-center py-12 md:py-24">
      <img src="/vite.svg" alt="Lynx Logo" className="mb-12 size-20" />

      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-linear-to-b from-white to-gray-500 bg-clip-text text-transparent">
        Sharp-eyed AI code review.
      </h1>

      <p className="max-w-175 text-base md:text-lg text-muted-foreground font-normal leading-relaxed mb-10">
        Catch bugs before they reach production. Lynx integrates with your
        CI/CD pipeline to provide human-like reasoning at machine speed.
      </p>

      <section className="w-full max-w-125 bg-card/40 border border-border rounded-xl p-6 backdrop-blur-sm shadow-2xl">
        <h2 className="text-base md:text-lg font-bold mb-4">
          Connect your repository to begin
        </h2>
        <button
          type="button"
          onClick={handleGithubLogin}
          className="flex items-center justify-center gap-3 w-full h-12 bg-white text-black rounded-lg font-semibold text-base hover:bg-gray-200 transition-all mb-3"
        >
          <Github className="w-4 h-4" />
          Log in with GitHub
        </button>
        <button
          type="button"
          onClick={handleGitlabLogin}
          className="flex items-center justify-center gap-3 w-full h-12 bg-[#e24329] text-white rounded-lg font-semibold text-base hover:bg-[#e24329]/90 transition-all"
        >
          <Gitlab className="w-4 h-4" />
          Log in with GitLab
        </button>
        <p className="mt-4 text-xs text-muted-foreground uppercase tracking-widest">
          Enterprise SSO available
        </p>
      </section>
    </header>
  );
}
