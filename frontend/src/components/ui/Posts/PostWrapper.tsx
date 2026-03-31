import { useState, useEffect } from 'react';
import Post from '../FilActu/post';
import PostEdit from './PostEdit';
import ReplyForm from './ReplyForm';
import ReplyEdit from './ReplyEdit';
import { getReplies, deleteReply, getCurrentUser } from '../../../lib/api';

interface PostWrapperProps {
  postId: number;
  authorName: string;
  authorHandle: string;
  authorId?: number;
  authorAvatar: string;
  timestamp: string;
  content: string;
  mediaUrl?: string;
  commentCount?: number;
  shareCount?: number;
  isAuthorBlocked?: boolean;
  isCensored?: boolean;
  isCurrentUserAuthor?: boolean;
  onComment?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onPostUpdated?: (updatedPost: any) => void;
}

export default function PostWrapper({
  postId,
  authorName,
  authorHandle,
  authorId,
  authorAvatar,
  timestamp,
  content,
  mediaUrl,
  commentCount = 0,
  shareCount = 0,
  isAuthorBlocked = false,
  isCensored = false,
  isCurrentUserAuthor = false,
  onComment,
  onShare,
  onDelete,
  onPostUpdated,
}: PostWrapperProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [currentContent, setCurrentContent] = useState(content);
  const [currentMediaUrl, setCurrentMediaUrl] = useState(mediaUrl);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyCount, setReplyCount] = useState(commentCount || 0);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);

  // Sync state with props when they change
  useEffect(() => {
    setCurrentContent(content);
    setCurrentMediaUrl(mediaUrl);
  }, [content, mediaUrl]);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // Fetch replies on mount or when showReplies changes
  useEffect(() => {
    if (showReplies) {
      const loadReplies = async () => {
        try {
          setLoadingReplies(true);
          const data = await getReplies(postId);
          setReplies(data || []);
          // Seulement mettre à jour le compteur si on a des données
          if (data && data.length > 0) {
            setReplyCount(data.length);
          }
        } catch (error) {
          console.error('Error loading replies:', error);
        } finally {
          setLoadingReplies(false);
        }
      };
      loadReplies();
    }
  }, [showReplies, postId]);

  const handleReplyAdded = async () => {
    // Reload replies after new reply is added
    try {
      const data = await getReplies(postId);
      setReplies(data || []);
      setReplyCount(data?.length || 0);
    } catch (error) {
      console.error('Error reloading replies:', error);
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
      const success = await deleteReply(replyId);
      if (success) {
        setReplies((prev) => prev.filter((r) => r.id !== replyId));
        setReplyCount((prev) => prev - 1);
      }
    }
  };

  const handleSaveEditedReply = (updatedReply: any) => {
    setReplies((prev) =>
      prev.map((r) => (r.id === updatedReply.id ? updatedReply : r))
    );
    setEditingReplyId(null);
  };

  const handleEditSave = (updatedPost: any) => {
    setCurrentContent(updatedPost.content);
    setCurrentMediaUrl(updatedPost.mediaUrl || null);
    onPostUpdated?.(updatedPost);
  };

  return (
    <>
      <Post
        postId={postId}
        authorName={authorName}
        authorHandle={authorHandle}
        authorId={authorId}
        authorAvatar={authorAvatar}
        timestamp={timestamp}
        content={
          isCensored ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 font-semibold">🚫 Post censuré</p>
              <p className="text-red-600 text-sm mt-2">{currentContent}</p>
            </div>
          ) : currentMediaUrl ? (
            <div className="space-y-2">
              <p>{currentContent}</p>
              {currentMediaUrl.match(/\.(mp4|webm|ogg)$/i) || currentMediaUrl.match(/^data:video\//i) ? (
                <video src={currentMediaUrl} controls className="w-full rounded-lg max-h-96 object-cover" />
              ) : (
                <img src={currentMediaUrl} alt="Post media" className="w-full rounded-lg max-h-96 object-cover" />
              )}
            </div>
          ) : (
            currentContent
          )
        }
        commentCount={isCensored ? 0 : replyCount}
        shareCount={isCensored ? 0 : shareCount}
        isAuthorBlocked={isAuthorBlocked}
        isCensored={isCensored}
        onComment={() => {
          if (!isCensored) {
            setShowReplies(!showReplies);
            onComment?.();
          }
        }}
        onShare={isCensored ? undefined : onShare}
        onDelete={onDelete}
        onMoreActions={() => {
          if (isCurrentUserAuthor && !isCensored) {
            setShowEditModal(true);
          }
        }}
      />

      {isCurrentUserAuthor && showEditModal && (
        <PostEdit
          postId={postId}
          initialContent={currentContent}
          initialMediaUrl={currentMediaUrl}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}

      {showReplies && !isCensored && (
        <div className="px-4 py-2 ml-2 border-l-2 border-gray-200">
          {/* Reply Form */}
          <ReplyForm postId={postId} onReplyAdded={handleReplyAdded} />
          
          {/* Replies List */}
          <div className="mt-4 space-y-4">
            {loadingReplies ? (
              <p className="text-gray-400 text-sm">Chargement des réponses...</p>
            ) : replies.length > 0 ? (
              replies.map((reply: any) => (
                <div key={reply.id} className="pl-4 pt-3 border-l border-gray-200 flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {reply.author?.profilePhoto && (
                        <img src={reply.author.profilePhoto} alt="avatar" className="w-6 h-6 rounded-full" />
                      )}
                      <span className="font-bold text-sm text-white">{reply.author?.name || 'Utilisateur'}</span>
                      <span className="text-gray-500 text-xs">@{reply.author?.mail?.split('@')[0] || 'utilisateur'}</span>
                      <span className="text-gray-400 text-xs">{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                    {reply.isCensored ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-2 text-center opacity-80 decoration-slice">
                        <p className="text-red-700 text-xs font-semibold">🚫 Cette réponse a été censurée par un modérateur.</p>
                      </div>
                    ) : (
                      <p className="text-white text-sm">{reply.textContent}</p>
                    )}
                  </div>
                  {currentUser && reply.author?.id === currentUser.id && !reply.isCensored && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingReplyId(reply.id)}
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded px-2 py-1 text-xs"
                        title="Modifier la réponse"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded px-2 py-1 text-xs"
                        title="Supprimer la réponse"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Aucune réponse pour le moment</p>
            )}
          </div>
        </div>
      )}

      {editingReplyId && (
        <ReplyEdit
          replyId={editingReplyId}
          initialContent={replies.find((r) => r.id === editingReplyId)?.textContent || ''}
          onClose={() => setEditingReplyId(null)}
          onSave={handleSaveEditedReply}
        />
      )}
    </>
  );
}
