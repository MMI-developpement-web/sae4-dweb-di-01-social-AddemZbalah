import { useState } from 'react';
import { createReply } from '../../../lib/api';

interface ReplyFormProps {
  postId: number;
  onReplyAdded: (reply: any) => void;
}

export default function ReplyForm({ postId, onReplyAdded }: ReplyFormProps) {
  const [textContent, setTextContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleReply = async () => {
    if (!textContent.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await createReply(postId, textContent.trim());

      if (result) {
        setTextContent('');
        setShowForm(false);
        onReplyAdded(result);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Erreur lors de l\'envoi de la réponse');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-blue-500 hover:text-blue-600"
      >
        Répondre
      </button>
    );
  }

  return (
    <div className="space-y-2 mt-2 pl-4 border-l border-gray-200" onClick={(e) => e.stopPropagation()}>
      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        maxLength={280}
        placeholder="Votre réponse..."
        className="w-full p-2 border border-gray-300 rounded text-sm text-white bg-gray-800"
        rows={2}
      />
      <div className="flex gap-2">
        <button
          onClick={() => {
            setShowForm(false);
            setTextContent('');
          }}
          disabled={isLoading}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 text-white hover:text-gray-900"
        >
          Annuler
        </button>
        <button
          onClick={handleReply}
          disabled={isLoading || !textContent.trim()}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
}
