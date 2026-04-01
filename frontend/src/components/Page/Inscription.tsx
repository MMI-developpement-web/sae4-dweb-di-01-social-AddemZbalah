import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ConnexionBtn from "../ui/Button/Connexion-Inscription_Btn";
import InputLogin from "../ui/Form/FormInputs";
import ConnexionVerif from "../ui/Form/ConnexionVerif";
import { register } from "../../lib/api";

export default function Inscription() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const hasMinLength = password.length >= 12;
  const hasDigit = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasMixedCase = hasUppercase && hasLowercase;
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const isFormValid = username && email && password && hasMinLength && hasDigit && hasMixedCase && hasSpecialChar;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormValid) {
      try {
        const data = await register({ username, email, password });

        if (data && data.message) {
          console.log("Inscription réussie:", data);
          alert("Inscription réussie! Veuillez confirmer votre email.");
          // Rediriger vers la connexion après succès
          navigate("/connexion");
        } else {
          console.error("Erreur d'inscription:", data);
          alert("Erreur lors de l'inscription. L'utilisateur existe peut-être déjà ?");
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
        alert("Erreur réseau lors de la tentative d'inscription.");
      }
    }
  };

  const handleLogin = () => {
    navigate("/connexion");
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-connexion">
      <section className="w-full max-w-sm rounded-xl border border-secondary/40 bg-secondary/25 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2.5 p-6 sm:p-8">
          <h1 className="mb-4 text-3xl font-semibold text-secondary text-center">
            Inscrivez-vous
          </h1>

          <fieldset className="flex w-full flex-col gap-6 py-8">
            <legend className="sr-only">Informations d'inscription</legend>

            <section className="flex flex-col gap-2.5">
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
            </section>

            <section className="flex flex-col gap-2.5">
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
                autoComplete="new-password"
                required
                aria-label="Mot de passe"
              />
            </section>
          </fieldset>

          <section className="flex w-full flex-col gap-3">
            <section className="grid grid-cols-2 gap-x-3 gap-y-2">
              <ConnexionVerif status={hasMinLength ? "valid" : "invalid"}>
                12 caracteres minimum
              </ConnexionVerif>
              <ConnexionVerif status={hasDigit ? "valid" : "invalid"}>
                1 chiffre minimum
              </ConnexionVerif>
              <ConnexionVerif status={hasMixedCase ? "valid" : "invalid"}>
                majuscule - minuscule
              </ConnexionVerif>
              <ConnexionVerif status={hasSpecialChar ? "valid" : "invalid"}>
                1 caractere special minimum
              </ConnexionVerif>
            </section>
          </section>

          <section className="mt-6 w-full">
            <ConnexionBtn
              variant="lavender"
              size="full"
              type="submit"
              disabled={!isFormValid}
            >
              S'inscrire
            </ConnexionBtn>
          </section>

          <section className="flex w-full items-center justify-center gap-2 py-4" role="separator" aria-label="ou">
            <hr className="w-24 border-t border-secondary/50" />
            <span className="text-sm font-semibold text-secondary">ou</span>
            <hr className="w-24 border-t border-secondary/50" />
          </section>

          <section className="flex w-full flex-col items-center gap-2.5">
            <p className="text-sm font-semibold text-secondary text-center">
              Deja un compte ?
            </p>
            <ConnexionBtn
              variant="lavender"
              size="full"
              type="button"
              onClick={handleLogin}
            >
              Se connecter
            </ConnexionBtn>
          </section>
        </form>
      </section>
    </main>
  );
}
