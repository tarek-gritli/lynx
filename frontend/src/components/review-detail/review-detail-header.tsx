import { ExternalLink, Folder } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import type { Review } from "@/hooks/use-reviews";

interface ReviewDetailHeaderProps {
  review: Review;
}

export function ReviewDetailHeader({ review }: ReviewDetailHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Folder className="size-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">{review.repo_name}</h1>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <a
          href={review.pr_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <span className="font-mono text-sm">Pull Request #{review.pr_number}</span>
          <ExternalLink className="size-4" />
        </a>
        <StatusBadge status={review.status} />
      </div>
    </header>
  );
}
