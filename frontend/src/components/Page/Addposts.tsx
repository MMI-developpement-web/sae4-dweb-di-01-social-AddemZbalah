import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ConnexionBtn from "../ui/Connexion-Inscription/Connexion-Inscription_Btn";
import AddPosts from "../ui/Posts/addPosts";
import { createPost } from "../../lib/api";

const MAX_POST_LENGTH = 200;

export default function Addposts() {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const navigate = useNavigate();

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
      await createPost(content);
      navigate("/");
    } catch (error: any) {
      console.error("Erreur réseau :", error);
      alert(error.message || "Problème de connexion avec le serveur backend.");
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
