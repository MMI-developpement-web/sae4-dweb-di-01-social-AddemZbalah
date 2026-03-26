import { useState } from 'react';
import { editPost } from '../../../lib/api';

interface PostEditProps {
  postId: number;
  initialContent: string;
  initialMediaUrl?: string | null;
  onClose: () => void;
  onSave: (updatedPost: any) => void;
}

export default function PostEdit({ postId, initialContent, initialMediaUrl, onClose, onSave }: PostEditProps) {
  const [content, setContent] = useState(initialContent);
  const [mediaUrl, setMediaUrl] = useState(initialMediaUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!content.trim()) {
      setMessage('Le contenu ne peut pas être vide');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const result = await editPost(postId, content.trim(), mediaUrl.trim() || undefined);

    if (result) {
      setMessage('✓ Post modifié avec succès');
      setTimeout(() => {
        onSave(result);
        onClose();
      }, 800);
    } else {
      setMessage('✗ Erreur lors de la modification');
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Modifier le post</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Contenu</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={280}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={4}
            />
            <span className="text-xs text-gray-500">{content.length}/280</span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL du média (optionnel)</label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="https://..."
            />
          </div>

          {message && (
            <div className={`text-sm font-medium ${message.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
