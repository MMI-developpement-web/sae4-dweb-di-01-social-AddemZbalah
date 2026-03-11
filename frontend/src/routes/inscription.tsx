import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ConnexionBtn from "../components/Connexion-Inscription/Connexion-Inscription_Btn";
import InputLogin from "../components/Connexion-Inscription/FormInputs";
import ConnexionVerif from "../components/Connexion-Inscription/ConnexionVerif";

export default function Inscription() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Critères de validation du mot de passe
  const hasMinLength = password.length >= 12;
  const hasDigit = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasMixedCase = hasUppercase && hasLowercase;
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const isFormValid = username && email && password && hasMinLength && hasDigit && hasMixedCase && hasSpecialChar;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormValid) {
      console.log("Inscription avec:", { username, email, password });
      // Logique d'inscription à implémenter
    }
  };

  const handleLogin = () => {
    navigate("/connexion");
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-connexion">
      <section className="w-full max-w-sm rounded-xl border border-secondary/40 bg-secondary/25 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2.5 p-6 sm:p-8">
          {/* Titre */}
          <h1 className="mb-4 text-3xl font-semibold text-secondary text-center">
            Inscrivez-vous
          </h1>

          {/* Conteneur des champs de formulaire */}
          <fieldset className="flex w-full flex-col gap-6 py-8">
            <legend className="sr-only">Informations d'inscription</legend>
            
            {/* Groupe Nom d'utilisateur */}
            <div className="flex flex-col gap-2.5">
              <label htmlFor="username" className="sr-only">
                Nom d'utilisateur
              </label>
              <InputLogin
                variant="dark"
                size="lg"
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                id="username"
                name="username"
                autoComplete="username"
                required
                aria-label="Nom d'utilisateur"
              />
            </div>

            {/* Groupe Email */}
            <div className="flex flex-col gap-2.5">
              <label htmlFor="email" className="sr-only">
                Adresse e-mail
              </label>
              <InputLogin
                variant="dark"
                size="lg"
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                autoComplete="email"
                required
                aria-label="Adresse e-mail"
              />
            </div>

            {/* Groupe Mot de passe */}
            <div className="flex flex-col gap-2.5">
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <InputLogin
                variant="dark"
                size="lg"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                name="password"
                autoComplete="new-password"
                required
                aria-label="Mot de passe"
              />
            </div>
          </fieldset>

          {/* Critères de validation du mot de passe */}
          <div className="flex w-full flex-col gap-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <ConnexionVerif status={hasMinLength ? "valid" : "invalid"}>
                12 caractères minimum
              </ConnexionVerif>
              <ConnexionVerif status={hasDigit ? "valid" : "invalid"}>
                1 chiffre minimum
              </ConnexionVerif>
              <ConnexionVerif status={hasMixedCase ? "valid" : "invalid"}>
                majuscule - minuscule
              </ConnexionVerif>
              <ConnexionVerif status={hasSpecialChar ? "valid" : "invalid"}>
                1 caractère spécial minimum
              </ConnexionVerif>
            </div>
          </div>

          {/* Bouton d'inscription */}
          <div className="mt-6 w-full">
            <ConnexionBtn
              variant="lavender"
              size="full"
              type="submit"
              disabled={!isFormValid}
            >
              S'inscrire
            </ConnexionBtn>
          </div>

          {/* Séparateur */}
          <div className="flex w-full items-center justify-center gap-2 py-4" role="separator" aria-label="ou">
            <hr className="w-24 border-t border-secondary/50" />
            <span className="text-sm font-semibold text-secondary">ou</span>
            <hr className="w-24 border-t border-secondary/50" />
          </div>

          {/* Section connexion */}
          <div className="flex w-full flex-col items-center gap-2.5">
            <p className="text-sm font-semibold text-secondary text-center">
              Déjà un compte ?
            </p>
            <ConnexionBtn
              variant="lavender"
              size="full"
              type="button"
              onClick={handleLogin}
            >
              Se connecter
            </ConnexionBtn>
          </div>
        </form>
      </section>
    </main>
  );
}
