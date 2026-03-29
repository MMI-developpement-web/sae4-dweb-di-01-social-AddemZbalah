import { useState } from "react";
import { pinPost, unpinPost } from "../../../lib/api";

interface PinButtonProps {
  postId: number;
  isPinned: boolean;
  isAuthor: boolean;
  onPinChange?: (isPinned: boolean) => void;
}

const PinIcon = () => (
  <svg
    className="size-full"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 2v20M2 12h20" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export function PinButton({
  postId,
  isPinned,
  isAuthor,
  onPinChange,
}: PinButtonProps) {
  const [loading, setLoading] = useState(false);

  if (!isAuthor) return null;

  const handlePin = async () => {
    try {
      setLoading(true);
      if (isPinned) {
        const success = await unpinPost(postId);
        if (success) {
          onPinChange?.(false);
        }
      } else {
        const success = await pinPost(postId);
        if (success) {
          onPinChange?.(true);
        }
      }
    } catch (err) {
      console.error("Error pinning/unpinning post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePin}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-0 py-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-page-dark h-9 text-sm ${
        isPinned
          ? "text-primary hover:text-primary/80"
          : "text-secondary/60 hover:text-secondary"
      }`}
      aria-label={isPinned ? "Désépingler" : "Épingler"}
      title={isPinned ? "Désépingler du profil" : "Épingler sur le profil"}
    >
      <div className="flex h-4 w-4 items-center justify-center">
        <PinIcon />
      </div>
    </button>
  );
}
