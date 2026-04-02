import { useState } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { editReply } from '../../../lib/api';

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

interface ReplyEditProps {
  replyId: number;
  initialContent: string;
  onClose: () => void;
  onSave: (updatedReply: any) => void;
}

export default function ReplyEdit({ replyId, initialContent, onClose, onSave }: ReplyEditProps) {
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!content.trim()) {
      setMessage('Le contenu ne peut pas être vide');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const result = await editReply(replyId, content.trim());

    if (result) {
      setMessage('✓ Réponse modifiée');
      setTimeout(() => {
        onSave(result);
        onClose();
      }, 800);
    } else {
      setMessage('✗ Erreur');
    }

    setIsLoading(false);
  };

  return (
    <dialog className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <article className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Modifier la réponse</h2>

        <fieldset className="space-y-4">
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={280}
              className={cn(inputFieldVariants(), 'resize-none')}
              rows={4}
            />
            <span className="text-xs text-gray-500">{content.length}/280</span>
          </div>

          {message && (
            <aside className={cn(messageVariants({ type: message.includes('✓') ? 'success' : 'error' }))}>
              {message}
            </aside>
          )}
        </fieldset>

        <div className="flex gap-2 mt-6">
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
        </div>
      </article>
    </dialog>
  );
}
