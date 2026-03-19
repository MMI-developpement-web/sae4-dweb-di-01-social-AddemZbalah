import { useMemo, useState, type FormEvent } from "react";
import ConnexionBtn from "../ui/Connexion-Inscription/Connexion-Inscription_Btn";
import AddPosts from "../ui/Posts/addPosts";

const MAX_POST_LENGTH = 200;

export default function Addposts() {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const remainingCharacters = useMemo(
    () => MAX_POST_LENGTH - content.length,
    [content.length],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Nouveau post", { content, mediaFile });

    // 1. Vérification côté frontend : empêcher d'envoyer un post vide
    if (!content.trim()) {
      alert("Votre post ne peut pas être vide !");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json", // Force Symfony à renvoyer du JSON, même pour les erreurs
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content: content }) 
        // Note: l'image (mediaFile) n'est pas envoyée ici pour l'instant !
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        // En cas d'erreur de token ou de validation
        let errorMessage = "Une erreur est survenue lors de la publication.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          if (response.status === 401) {
            errorMessage = "Vous devez être connecté (Token invalide ou manquant) !";
          }
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("Problème réseau : Le serveur backend n'est peut-être pas lancé ou refuse la connexion (CORS).");
    }
  };

  return (
    <main className="flex min-h-screen items-start justify-center bg-connexion p-4 sm:p-8">
      <article className="w-full max-w-4xl rounded-3xl border border-secondary/30 bg-secondary/25 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <header className="flex items-center gap-3">
          <p className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-primary to-secondary text-xl font-semibold text-primary-foreground">
            U
          </p>
          <section aria-label="Informations utilisateur" className="leading-tight">
            <h1 className="text-xl font-semibold text-secondary">Utilisateur</h1>
            <p className="text-base font-semibold text-secondary/70">@utilisateur</p>
          </section>
        </header>

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          <section className="rounded-2xl border border-secondary p-5">
            <label htmlFor="post-content" className="sr-only">
              Votre texte
            </label>
            <textarea
              id="post-content"
              name="post-content"
              value={content}
              onChange={(event) => setContent(event.target.value.slice(0, MAX_POST_LENGTH))}
              maxLength={MAX_POST_LENGTH}
              rows={5}
              placeholder="Votre texte"
              className="w-full resize-none bg-transparent text-2xl font-semibold text-secondary placeholder:text-secondary/80 focus:outline-none"
            />
            <p className="mt-2 text-right text-2xl font-semibold text-secondary/70">
              {MAX_POST_LENGTH - remainingCharacters}/{MAX_POST_LENGTH}
            </p>
          </section>

          <AddPosts onMediaChange={setMediaFile} />

          <div className="flex justify-center">
            <ConnexionBtn type="submit" variant="lavender" size="lg" className="w-full max-w-[461px] text-[17px]">
              Publier
            </ConnexionBtn>
          </div>
        </form>
      </article>
    </main>
  );
}
