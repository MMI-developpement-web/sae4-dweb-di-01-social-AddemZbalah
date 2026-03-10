import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

// SVG Icons as components
const MessageCircleIcon = () => (
  <svg
    className="size-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const RepeatIcon = () => (
  <svg
    className="size-full"
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

const HeartIcon = () => (
  <svg
    className="size-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon = () => (
  <svg
    className="size-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

// Action button component
const actionButtonVariants = cva(
  "inline-flex items-center gap-1.5 px-0 py-0 text-secondary/60 transition-all duration-200 hover:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-page-dark",
  {
    variants: {
      size: {
        sm: "h-[1.09rem] text-[0.45rem]",
        md: "h-6 text-xs",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

interface ActionButtonProps
  extends VariantProps<typeof actionButtonVariants> {
  icon: ReactNode;
  count?: number;
  ariaLabel: string;
}

function ActionButton({
  icon,
  count,
  ariaLabel,
  size,
  className,
  ...props
}: ActionButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(actionButtonVariants({ size }), className)}
      aria-label={ariaLabel}
      {...props}
    >
      <div className="flex h-2 w-2 items-center justify-center">
        {icon}
      </div>
      {count !== undefined && <span className="font-medium">{count}</span>}
    </button>
  );
}

// Post content variants
const postContentVariants = cva(
  "text-secondary/90 leading-tight",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// Main Post Component
interface PostProps {
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
  commentCount?: number;
  shareCount?: number;
  likeCount?: number;
  onComment?: () => void;
  onShare?: () => void;
  onLike?: () => void;
  onMoreActions?: () => void;
  className?: string;
}

export default function Post({
  authorName,
  authorHandle,
  authorAvatar,
  timestamp,
  content,
  commentCount = 0,
  shareCount = 0,
  likeCount = 0,
  onComment,
  onShare,
  onLike,
  onMoreActions,
  className,
}: PostProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 bg-page-dark px-4 py-3 transition-colors duration-200 hover:bg-primary/8",
        className
      )}
    >
      {/* Header: Author info */}
      <header className="flex gap-3">
        {/* Avatar */}
        <figure className="flex-shrink-0">
          <img
            src={authorAvatar}
            alt={authorName}
            className="h-7 w-7 rounded-full object-cover ring-1 ring-primary/30"
          />
        </figure>

        {/* Author metadata */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-secondary text-[0.58rem] leading-tight">
              {authorName}
            </p>
            <p className="text-[0.52rem] text-secondary/70">@{authorHandle}</p>
            <span className="text-[0.52rem] text-secondary/40">·</span>
            <time className="text-[0.52rem] text-secondary/60">
              {timestamp}
            </time>
          </div>
        </div>

        {/* More actions button */}
        {onMoreActions && (
          <button
            onClick={onMoreActions}
            className="flex h-5 w-5 items-center justify-center rounded-full text-secondary/60 transition-all duration-200 hover:bg-primary/20 hover:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Plus d'options"
          >
            <svg
              className="size-full"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="6" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="18" cy="12" r="1.5" />
            </svg>
          </button>
        )}
      </header>

      {/* Post content */}
      <section className={cn(postContentVariants({ size: "md" }))}>
        {content}
      </section>

      {/* Action buttons */}
      <section
        className="flex items-center justify-between gap-1 pt-1"
        role="group"
        aria-label="Actions post"
      >
        <ActionButton
          icon={<MessageCircleIcon />}
          count={commentCount}
          ariaLabel={`${commentCount} commentaires`}
          onClick={onComment}
          size="sm"
        />
        <ActionButton
          icon={<RepeatIcon />}
          count={shareCount}
          ariaLabel={`${shareCount} partages`}
          onClick={onShare}
          size="sm"
        />
        <ActionButton
          icon={<HeartIcon />}
          count={likeCount}
          ariaLabel={`${likeCount} likes`}
          onClick={onLike}
          size="sm"
        />
        <ActionButton
          icon={<ShareIcon />}
          ariaLabel="Partager"
          onClick={onMoreActions}
          size="sm"
        />
      </section>
    </article>
  );
}

export { Post };
