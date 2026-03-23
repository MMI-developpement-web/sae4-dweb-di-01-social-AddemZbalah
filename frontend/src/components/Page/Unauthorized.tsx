import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-page-dark overflow-hidden font-['Inter']">
      {/* Fond avec dégradé similaire aux autres pages */}
      <div className="absolute inset-0 bg-connexion opacity-80 pointer-events-none"></div>

      {/* Bouton Retour en haut à gauche */}
      <div className="absolute left-6 top-8 z-10 lg:left-10 lg:top-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-primary hover:text-secondary transition-colors font-semibold text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
          aria-label="Retour à la page précédente"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Retour</span>
        </button>
      </div>

      {/* Contenu central */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="flex flex-col items-center max-w-3xl gap-12">
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-secondary leading-tight">
              Bienvenue sur le panel <span className="text-primary">administrateur</span>.
            </h1>
            <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-secondary leading-tight mt-6">
              Veuillez vous <span className="text-primary">connecter</span> pour accéder à cet espace.
            </p>
          </div>

          <button
            onClick={() => navigate("/connexion")}
            className="mt-8 rounded-full bg-secondary px-8 py-4 text-lg font-semibold text-page-dark transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2 focus:ring-offset-page-dark shadow-xl"
          >
            Se connecter
          </button>
          
        </div>
      </section>

      {/* Image de décoration optionnelle si présente dans le dossier (remplacement basique de l'Image 5) */}
      <div className="absolute top-1/4 right-0 lg:right-24 h-64 w-64 opacity-50 blur-sm pointer-events-none hidden md:block">
         <div className="w-full h-full bg-primary/20 rounded-full blur-3xl"></div>
      </div>
    </main>
  );
}
