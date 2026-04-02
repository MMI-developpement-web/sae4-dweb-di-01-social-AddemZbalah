import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import LikeButton from "../Button/LikeButton";


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


const TrashIcon = () => (
  <svg
    className="size-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const actionButtonVariants = cva(
  "inline-flex items-center gap-2 px-0 py-0 text-secondary/60 transition-all duration-200 hover:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-page-dark",
  {
    variants: {
      size: {
        sm: "h-8 text-xs",
        md: "h-9 text-sm",
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
  ...props
}: ActionButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(actionButtonVariants({ size }))}
      aria-label={ariaLabel}
      {...props}
    >
      <div className="flex h-4 w-4 items-center justify-center">
        {icon}
      </div>
      {count !== undefined && <span className="font-medium">{count}</span>}
    </button>
  );
}

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

const postVariants = cva(
  "flex flex-col bg-page-dark transition-colors duration-200 hover:bg-primary/8",
  {
    variants: {
      density: {
        compact: "gap-2 px-3 py-2",
        comfy: "gap-3 px-4 py-3",
      },
    },
    defaultVariants: {
      density: "comfy",
    },
  }
);

const postHeaderVariants = cva("flex gap-3");
const avatarImageVariants = cva("rounded-full object-cover ring-1 ring-primary/30", {
  variants: {
    size: {
      sm: "h-7 w-7",
      md: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const authorMetaVariants = cva("text-secondary/70", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const timestampVariants = cva("text-secondary/60", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-xs",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const separatorVariants = cva("text-secondary/40", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-xs",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const moreActionsButtonVariants = cva(
  "flex items-center justify-center rounded-full text-secondary/60 transition-all duration-200 hover:bg-primary/20 hover:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
  {
    variants: {
      size: {
        sm: "h-5 w-5",
        md: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
);

const actionsGroupVariants = cva("flex items-center justify-between gap-1 pt-1");

interface PostProps {
  postId: number;
  authorName: string;
  authorHandle: string;
  authorId?: number;
  authorAvatar: string;
  timestamp: string;
  content: string | React.ReactNode;
  commentCount?: number;
  shareCount?: number;
  isAuthorBlocked?: boolean;
  isCensored?: boolean;
  onComment?: () => void;
  onShare?: () => void;
  onMoreActions?: () => void;
  onDelete?: () => void;
}

export default function Post({
  postId,
  authorName,
  authorHandle,
  authorId,
  authorAvatar,
  timestamp,
  content,
  commentCount = 0,
  shareCount = 0,
  isAuthorBlocked = false,
  isCensored = false,
  onComment,
  onShare,
  onMoreActions,
  onDelete,
}: PostProps) {
  const navigate = useNavigate();

  const handleAuthorClick = () => {
    if (authorId && !isAuthorBlocked) {
      navigate(`/profil/${authorId}`);
    }
  };
  return (
    <article className={cn(postVariants({ density: "comfy" }))}>
      <header className={cn(postHeaderVariants())}>
        <figure className="shrink-0">
          <button
            onClick={handleAuthorClick}
            disabled={isAuthorBlocked}
            className={cn("rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary", isAuthorBlocked ? "cursor-not-allowed opacity-60" : "hover:opacity-80 transition-opacity")}
            aria-label={isAuthorBlocked ? `${authorName} - Compte bloqué` : `Voir le profil de ${authorName}`}
          >
            <img
              src={authorAvatar}
              alt={authorName}
              className={cn(avatarImageVariants({ size: "sm" }))}
            />
          </button>
        </figure>

        <header className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAuthorClick}
              disabled={isAuthorBlocked}
              className={cn("font-semibold text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1", isAuthorBlocked ? "cursor-not-allowed opacity-70" : "hover:underline")}
            >
              {authorName}
            </button>
            {isAuthorBlocked ? (
              <p className={cn(authorMetaVariants({ size: "sm" }), "text-red-500 font-medium")}>Compte bloqué</p>
            ) : (
              <>
                <p className={cn(authorMetaVariants({ size: "sm" }))}>@{authorHandle}</p>
                <span className={cn(separatorVariants({ size: "sm" }))}>·</span>
                <time className={cn(timestampVariants({ size: "sm" }))}>
                  {timestamp}
                </time>
              </>
            )}
          </div>
        </header>

        {onDelete && (
          <button
            onClick={onDelete}
            className={cn(moreActionsButtonVariants({ size: "sm" }), "text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer")}
            aria-label="Supprimer le post"
          >
            <TrashIcon />
          </button>
        )}

        {onMoreActions && (
          <button
            onClick={onMoreActions}
            className={cn(moreActionsButtonVariants({ size: "sm" }))}
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

      <section className={cn(postContentVariants({ size: "md" }))}>
        {content}
      </section>

    
      {!isCensored && (
        <section
          className={cn(actionsGroupVariants())}
          role="group"
          aria-label="Actions post"
        >
          <ActionButton
            icon={<MessageCircleIcon />}
            count={commentCount}
            ariaLabel={`${commentCount} commentaires`}
            onClick={onComment}
            size="md"
          />
          <ActionButton
            icon={<RepeatIcon />}
            count={shareCount}
            ariaLabel={`${shareCount} partages`}
            onClick={onShare}
            size="md"
          />
          <LikeButton postId={postId} size="md" />
          <ActionButton
            icon={<ShareIcon />}
            ariaLabel="Partager"
            onClick={onMoreActions}
            size="md"
          />
        </section>
      )}
    </article>
  );
}

export { Post };
