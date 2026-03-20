import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ConnexionBtn from "../ui/Connexion-Inscription/Connexion-Inscription_Btn";
import InputLogin from "../ui/Connexion-Inscription/FormInputs";
import { login } from "../../lib/api";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const result = await login(email, password);
    if (result && result.token) {
        navigate("/");
    } else {
        alert("Identifiants invalides ou problème de connexion.");
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
                autoComplete="current-password"
                required
                aria-label="Mot de passe"
              />
            </div>
          </fieldset>

          <div className="flex w-full flex-col items-center gap-2.5">
            <ConnexionBtn
              variant="lavender"
              size="full"
              type="submit"
            >
              Se connecter
            </ConnexionBtn>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-secondary transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary"
            >
              Mot de passe oublie ?
            </button>
          </div>

          <div className="flex w-full items-center justify-center gap-2 py-4" role="separator" aria-label="ou">
            <hr className="w-24 border-t border-secondary/50" />
            <span className="text-sm font-semibold text-secondary">ou</span>
            <hr className="w-24 border-t border-secondary/50" />
          </div>

          <div className="flex w-full flex-col items-center gap-2.5">
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
          </div>
        </form>
      </section>
    </main>
  );
}
