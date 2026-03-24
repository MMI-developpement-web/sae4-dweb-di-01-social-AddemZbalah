import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(
    localStorage.getItem("autoRefreshInterval") !== null
  );
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(
    localStorage.getItem("autoRefreshInterval")
      ? parseInt(localStorage.getItem("autoRefreshInterval")!)
      : 60
  );

  const handleSaveSettings = () => {
    if (autoRefreshEnabled) {
      localStorage.setItem("autoRefreshInterval", autoRefreshInterval.toString());
    } else {
      localStorage.removeItem("autoRefreshInterval");
    }
    alert("Paramètres sauvegardés avec succès!");
  };

  return (
    <main className="flex min-h-screen bg-fil items-start overflow-hidden justify-center lg:justify-start">
      <article className="flex w-full max-w-2xl flex-col overflow-y-auto scrollbar-hide border-x border-primary/20 lg:max-w-4xl">
        {/* Header avec bouton retour */}
        <header className="sticky top-0 z-20 bg-fil/95 backdrop-blur flex items-center gap-4 px-4 py-4 border-b border-primary/20">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white flex-shrink-0"
            aria-label="Retour"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-primary">Paramètres</h1>
        </header>

        {/* Settings Content */}
        <section className="p-6 space-y-8">
          {/* Auto-Refresh Section */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-2">
                Rafraîchissement automatique
              </h2>
              <p className="text-sm text-secondary/70">
                Activez le rafraîchissement automatique pour mettre à jour votre fil d'actualité à intervalles réguliers.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between py-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    autoRefreshEnabled ? "bg-purple-500" : "bg-primary/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      autoRefreshEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
                <span className="text-primary font-medium">
                  {autoRefreshEnabled ? "Activé" : "Désactivé"}
                </span>
              </label>
            </div>

            {/* Interval Selection */}
            {autoRefreshEnabled && (
              <div className="space-y-3 pt-4 border-t border-primary/20">
                <label htmlFor="refresh-interval" className="block text-sm font-medium text-primary">
                  Intervalle de rafraîchissement
                </label>
                <div className="flex gap-2">
                  <input
                    id="refresh-interval"
                    type="number"
                    min="10"
                    max="600"
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(Math.max(10, parseInt(e.target.value) || 60))}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary placeholder-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                  />
                  <span className="flex items-center text-sm text-secondary px-3 bg-primary/10 rounded-lg border border-primary/20">
                    secondes
                  </span>
                </div>
                <div className="flex gap-2 text-xs text-secondary/60">
                  <button
                    type="button"
                    onClick={() => setAutoRefreshInterval(30)}
                    className="px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    30s
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoRefreshInterval(60)}
                    className="px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    1m
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoRefreshInterval(300)}
                    className="px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    5m
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoRefreshInterval(600)}
                    className="px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    10m
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSaveSettings}
              className="flex-1 px-6 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              Sauvegarder les paramètres
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 rounded-lg border border-primary/20 text-primary hover:bg-primary/10 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Annuler
            </button>
          </div>
        </section>
      </article>
    </main>
  );
}
