import { useState, useEffect } from "react";
import { getUserSettings, updateUserSettings } from "../../../lib/api";

export function SettingsPanel() {
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await getUserSettings();
        if (settings) {
          setIsReadOnly(settings.isReadOnly || false);
          setIsPrivate(settings.isPrivate || false);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Erreur lors du chargement des paramètres");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const result = await updateUserSettings({
        isReadOnly,
        isPrivate,
      });

      if (result && result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Erreur lors de la mise à jour des paramètres");
      }
    } catch (err) {
      console.error("Error updating settings:", err);
      setError("Erreur lors de la mise à jour des paramètres");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="bg-page-dark border border-secondary/20 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-secondary">Paramètres du Compte</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded p-3 text-green-400 text-sm">
          Paramètres mis à jour avec succès
        </div>
      )}

      {/* US 2.3: Mode lecture seule */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-secondary font-medium">Mode lecture seule</label>
            <p className="text-secondary/70 text-sm">
              Aucun utilisateur ne peut commenter vos tweets
            </p>
          </div>
          <button
            onClick={() => setIsReadOnly(!isReadOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isReadOnly ? "bg-primary" : "bg-secondary/30"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isReadOnly ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mode compte privé */}
      <div className="space-y-3 border-t border-secondary/20 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-secondary font-medium">Compte privé</label>
            <p className="text-secondary/70 text-sm">
              Seul vos abonnés peuvent voir vos tweets
            </p>
          </div>
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPrivate ? "bg-primary" : "bg-secondary/30"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPrivate ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-white font-semibold py-2 rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
