import { useMemo, useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConnexionBtn from "../ui/Connexion-Inscription/Connexion-Inscription_Btn";
import AddPosts from "../ui/Posts/addPosts";
import { createPost, getCurrentUser, fileToBase64 } from "../../lib/api";

const MAX_POST_LENGTH = 200;

export default function Addposts() {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch current user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        } else {
          navigate("/connexion");
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        navigate("/connexion");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [navigate]);

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
      let mediaUrl: string | undefined = undefined;
      
      // Convert File to base64 if media is selected
      if (mediaFile) {
        mediaUrl = await fileToBase64(mediaFile);
      }
      
      await createPost(content, mediaUrl);
      navigate("/fil");
    } catch (error: any) {
      console.error("Erreur réseau :", error);
      alert(error.message || "Problème de connexion avec le serveur backend.");
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-start justify-center bg-connexion p-4 sm:p-8">
        <div className="flex items-center justify-center">
          <p className="text-secondary">Chargement...</p>
        </div>
      </main>
    );
  }

  const userHandle = currentUser?.name?.toLowerCase().replace(/\s/g, '') || 'utilisateur';

  return (
    <main className="flex min-h-screen items-start justify-center bg-connexion p-4 sm:p-8">
      <article className="w-full max-w-4xl rounded-3xl border border-secondary/30 bg-secondary/25 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <header className="flex items-center gap-3">
          <p className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-b from-primary to-secondary text-xl font-semibold text-primary-foreground">
            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
          </p>
          <section aria-label="Informations utilisateur" className="leading-tight">
            <h1 className="text-xl font-semibold text-secondary">{currentUser?.name || 'Utilisateur'}</h1>
            <p className="text-base font-semibold text-secondary/70">@{userHandle}</p>
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
            <ConnexionBtn type="submit" variant="lavender" size="lg" className="w-full max-w-md text-base">
              Publier
            </ConnexionBtn>
          </div>
        </form>
      </article>
    </main>
  );
}
