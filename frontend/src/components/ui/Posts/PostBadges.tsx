/**
 * Component for displaying a retweeted post with retweet information
 * US: Retweet functionality
 */

import { ReactNode } from "react";
import { cn } from "../../../lib/utils";

const RetweetBadgeIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="17 2 21 6 17 10" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <polyline points="7 22 3 18 7 14" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

interface RetweetBadgeProps {
  retweeterName: string;
  retweeterHandle: string;
  showComment?: boolean;
}

export function RetweetBadge({
  retweeterName,
  retweeterHandle,
  showComment = false,
}: RetweetBadgeProps) {
  return (
    <div className="flex items-center gap-2 mb-3 text-secondary/60 text-sm px-4">
      <div className="flex items-center gap-1.5">
        <RetweetBadgeIcon />
        <span>
          <strong>{retweeterName}</strong> a retweeté{showComment && " avec commentaire"}
        </span>
      </div>
    </div>
  );
}

interface RetweetCommentProps {
  comment: string;
}

export function RetweetComment({ comment }: RetweetCommentProps) {
  if (!comment) return null;

  return (
    <div className="px-4 py-2 bg-black/20 border-l-2 border-primary/50 text-secondary/80 text-sm italic">
      {comment}
    </div>
  );
}

interface PinnedPostBadgeProps {
  children?: ReactNode;
}

export function PinnedPostBadge({ children }: PinnedPostBadgeProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 mb-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded",
      "text-primary text-xs font-medium"
    )}>
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2v20M2 12h20" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span>Post épinglé</span>
      {children}
    </div>
  );
}
