import { useState, useRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';
import { updateUserProfileV2 } from '../../../lib/api';

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
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const bannerImageInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setProfilePhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setBannerImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');

    const result = await updateUserProfileV2({
      bio: bio || undefined,
      location: location || undefined,
      website: website || undefined,
      profilePhoto: profilePhotoFile || profilePhoto || undefined,
      bannerImage: bannerImageFile || bannerImage || undefined,
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
    <dialog className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <article className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Modifier le profil</h2>

        <fieldset className="space-y-4">
          <fieldset>
            <legend className="sr-only">Bio</legend>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              className={cn(inputFieldVariants())}
              rows={3}
            />
          </fieldset>

          <fieldset>
            <legend className="sr-only">Localisation</legend>
            <label className="block text-sm font-medium mb-2">Localisation</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
              className={cn(inputFieldVariants())}
              placeholder="Ex: Paris, France"
            />
          </fieldset>

          <fieldset>
            <legend className="sr-only">Site Web</legend>
            <label className="block text-sm font-medium mb-2">Site Web</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              maxLength={500}
              className={cn(inputFieldVariants())}
              placeholder="https://exemple.com"
            />
          </fieldset>

          <fieldset>
            <legend className="sr-only">Photo de profil</legend>
            <label className="block text-sm font-medium mb-2">Photo de profil</label>
            {profilePhoto && (
              <img src={profilePhoto} alt="Aperçu" className="w-20 h-20 rounded-full object-cover mb-2 border border-gray-300" />
            )}
            <input
              ref={profilePhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => profilePhotoInputRef.current?.click()}
              className={cn(uploadButtonVariants({ state: profilePhotoFile ? 'filled' : 'empty' }))}
            >
              {profilePhotoFile ? `✓ ${profilePhotoFile.name}` : '📁 Choisir une photo'}
            </button>
          </fieldset>

          <fieldset>
            <legend className="sr-only">Bannière</legend>
            <label className="block text-sm font-medium mb-2">Bannière</label>
            {bannerImage && (
              <img src={bannerImage} alt="Aperçu" className="w-full h-20 object-cover mb-2 rounded border border-gray-300" />
            )}
            <input
              ref={bannerImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => bannerImageInputRef.current?.click()}
              className={cn(uploadButtonVariants({ state: bannerImageFile ? 'filled' : 'empty' }))}
            >
              {bannerImageFile ? `✓ ${bannerImageFile.name}` : '📁 Choisir une bannière'}
            </button>
          </fieldset>

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
