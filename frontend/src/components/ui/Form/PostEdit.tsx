import { useState, useRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { editPost } from '../../../lib/api';

const inputFieldVariants = cva(
  'w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
);

const messageVariants = cva('text-sm font-medium', {
  variants: {
    type: {
      success: 'text-green-600',
      error: 'text-red-600',
    },
  },
});

const buttonVariants = cva(
  'flex-1 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50',
  {
    variants: {
      intent: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
      },
    },
  },
);

const uploadButtonVariants = cva(
  'w-full px-4 py-2 rounded font-medium transition-colors border-2 border-dashed cursor-pointer hover:border-blue-500 hover:bg-blue-50',
  {
    variants: {
      state: {
        empty: 'border-gray-300 text-gray-600',
        filled: 'border-green-500 text-green-700 bg-green-50',
      },
    },
  },
);

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
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = () => setMediaUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
    <dialog className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <article className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Modifier le post</h2>

        <fieldset className="space-y-4">
          <fieldset>
            <legend className="sr-only">Contenu</legend>
            <label className="block text-sm font-medium mb-2">Contenu</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={280}
              className={cn(inputFieldVariants(), 'resize-none')}
              rows={4}
            />
            <span className="text-xs text-gray-500">{content.length}/280</span>
          </fieldset>

          <fieldset>
            <legend className="sr-only">Média</legend>
            <label className="block text-sm font-medium mb-2">Média (optionnel)</label>
            {mediaUrl && (
              mediaUrl.match(/\.(mp4|webm|ogg)$/i) || mediaUrl.match(/^data:video\//i) ? (
                <video src={mediaUrl} controls className="w-full h-40 object-cover mb-2 rounded border border-gray-300" />
              ) : (
                <img src={mediaUrl} alt="Aperçu du média" className="w-full h-40 object-cover mb-2 rounded border border-gray-300" />
              )
            )}
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              className={cn(uploadButtonVariants({ state: mediaFile ? 'filled' : 'empty' }))}
            >
              {mediaFile ? `✓ ${mediaFile.name}` : '📁 Choisir un média'}
            </button>
          </fieldset>

          {message && (
            <aside className={cn(messageVariants({ type: message.includes('✓') ? 'success' : 'error' }))}>
              {message}
            </aside>
          )}
        </fieldset>

        <footer className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={cn(buttonVariants({ intent: 'secondary' }))}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={cn(buttonVariants({ intent: 'primary' }))}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </footer>
      </article>
    </dialog>
  );
}
