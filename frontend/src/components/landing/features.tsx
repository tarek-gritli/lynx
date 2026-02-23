import { Brain, Code2, GitPullRequest } from "lucide-react";
import { FeatureCard } from "@/components/cards/feature-card";

const FEATURES = [
  {
    icon: Code2,
    title: "Static Analysis",
    description:
      "Deep scan for syntax errors, security vulnerabilities, and legacy patterns in 25+ languages.",
  },
  {
    icon: Brain,
    title: "AI Reasoning",
    description:
      "Context-aware logic checks that understand your business requirements and architecture.",
  },
  {
    icon: GitPullRequest,
    title: "PR Automation",
    description:
      "Instant feedback loops directly in your PRs with automated fix suggestions and CI blocking.",
  },
];

export function Features() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-20 border-t border-border/50 mt-10">
      {FEATURES.map((feature) => (
        <FeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </section>
  );
}
