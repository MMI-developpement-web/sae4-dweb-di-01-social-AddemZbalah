import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ConnexionBtn from "../ui/Button/Connexion-Inscription_Btn";
import InputLogin from "../ui/Form/FormInputs";
import { login, getCurrentUser } from "../../lib/api";
import { useStore } from "../../store/StoreContext";

export default function Connexion() {
  const { login: storeLogin } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    console.log('Form submitted with email:', email);
    
    try {
      const result = await login(email, password);
      console.log('Login result:', result);
      
      if (result && result.token) {
          console.log('Login successful, redirecting to fil');
          const user = await getCurrentUser();
          if (user) {
            storeLogin(user);
          }
          navigate("/fil");
      } else if (result?.error) {
          setError(result.error);
      } else {
          setError("Identifiants invalides ou problème de connexion.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log("Mot de passe oublie");
  };

  const handleCreateAccount = () => {
    navigate("/inscription");
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-connexion">
      <section className="w-full max-w-md rounded-xl border border-secondary/40 bg-secondary/25 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2.5 p-6 sm:p-8">
          <h1 className="mb-4 text-3xl font-semibold text-secondary">
            Connectez-vous
          </h1>

          <fieldset className="flex w-full flex-col gap-6 py-8">
            <legend className="sr-only">Informations de connexion</legend>

            {error && (
              <section className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                <p className="text-sm font-medium text-red-400">{error}</p>
              </section>
            )}

            <section className="flex flex-col gap-2.5">
              <label htmlFor="email" className="sr-only">
                Adresse e-mail
              </label>
              <InputLogin
                variant="dark"
                size="lg"
                type="text"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                autoComplete="email"
                required
                aria-label="Adresse e-mail"
                disabled={isLoading}
              />
            </section>

            <section className="flex flex-col gap-2.5">
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
                autoComplete="current-password"
                required
                aria-label="Mot de passe"
                disabled={isLoading}
              />
            </section>
          </fieldset>

          <section className="flex w-full flex-col items-center gap-2.5">
            <ConnexionBtn
              variant="lavender"
              size="full"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </ConnexionBtn>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-secondary transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary"
            >
              Mot de passe oublie ?
            </button>
          </section>

          <section className="flex w-full items-center justify-center gap-2 py-4" role="separator" aria-label="ou">
            <hr className="w-24 border-t border-secondary/50" />
            <span className="text-sm font-semibold text-secondary">ou</span>
            <hr className="w-24 border-t border-secondary/50" />
          </section>

          <section className="flex w-full flex-col items-center gap-2.5">
            <p className="text-sm font-semibold text-secondary text-center">
              Pas encore de compte ?
            </p>
            <ConnexionBtn
              variant="lavender"
              size="full"
              type="button"
              onClick={handleCreateAccount}
            >
              Creer un compte
            </ConnexionBtn>
          </section>
        </form>
      </section>
    </main>
  );
}
