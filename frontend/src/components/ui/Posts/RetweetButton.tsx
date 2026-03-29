import { useState } from "react";
import { retweetPost, unretweetPost } from "../../../lib/api";

interface RetweetButtonProps {
  postId: number;
  isRetweeted: boolean;
  isAuthor: boolean;
  onRetweetChange?: (isRetweeted: boolean) => void;
}

const RetweetIcon = () => (
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

export function RetweetButton({
  postId,
  isRetweeted,
  isAuthor,
  onRetweetChange,
}: RetweetButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");

  if (isAuthor) return null;

  const handleRetweet = async () => {
    try {
      setLoading(true);
      if (isRetweeted) {
        const success = await unretweetPost(postId);
        if (success) {
          onRetweetChange?.(false);
          setComment("");
        }
      } else {
        // Show modal for optional comment
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error retweeting:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRetweet = async () => {
    try {
      setLoading(true);
      const result = await retweetPost(postId, comment || undefined);
      if (result) {
        onRetweetChange?.(true);
        setComment("");
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error retweeting with comment:", err);
      alert("Erreur lors du retweet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleRetweet}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-0 py-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-page-dark h-9 text-sm ${
          isRetweeted
            ? "text-green-500 hover:text-green-400"
            : "text-secondary/60 hover:text-secondary"
        }`}
        aria-label={isRetweeted ? "Annuler le retweet" : "Retweet"}
        title={isRetweeted ? "Annuler le retweet" : "Retweet"}
      >
        <div className="flex h-4 w-4 items-center justify-center">
          <RetweetIcon />
        </div>
      </button>

      {/* Modal for retweet with comment */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-page-dark border border-secondary/30 rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-secondary mb-4">
              Retweet
            </h2>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajouter un commentaire (optionnel)..."
              maxLength={280}
              className="w-full bg-black/30 border border-secondary/30 rounded p-3 text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary resize-none"
              rows={3}
            />

            <p className="text-xs text-secondary/50 mt-2">
              {comment.length}/280
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setComment("");
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-secondary/30 rounded-full text-secondary hover:bg-secondary/10 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmRetweet}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "..." : "Retweet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
