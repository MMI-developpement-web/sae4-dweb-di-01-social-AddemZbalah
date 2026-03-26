import { useState } from 'react';
import { updateUserProfileV2 } from '../../../lib/api';

interface ProfileEditProps {
  user: any;
  onClose: () => void;
  onSave: (updatedUser: any) => void;
}

export default function ProfileEdit({ user, onClose, onSave }: ProfileEditProps) {
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [bannerImage, setBannerImage] = useState(user?.bannerImage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');

    const result = await updateUserProfileV2({
      bio: bio || undefined,
      location: location || undefined,
      website: website || undefined,
      profilePhoto: profilePhoto || undefined,
      bannerImage: bannerImage || undefined,
    });

    if (result && result.success) {
      setMessage('✓ Profil mis à jour avec succès');
      setTimeout(() => {
        onSave(result.user);
        onClose();
      }, 1000);
    } else {
      setMessage('✗ Erreur lors de la mise à jour');
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Modifier le profil</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Localisation</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Ex: Paris, France"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Site Web</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              maxLength={500}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="https://exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Photo de profil (URL)</label>
            <input
              type="url"
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="https://exemple.com/photo.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bannière (URL)</label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="https://exemple.com/banniere.jpg"
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
