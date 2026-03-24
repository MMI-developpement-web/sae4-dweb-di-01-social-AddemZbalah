import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { NavLink } from "react-router-dom";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

// ── Sidebar nav ──────────────────────────────────────────────────────────────

const sidebarItemVariants = cva(
  "flex w-full items-center gap-4 rounded-xl px-6 py-4 text-secondary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground",
        false: "hover:bg-secondary/10",
      },
    },
    defaultVariants: { active: false },
  }
);

type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",    to: "/dashboard",    icon: <span className="flex h-6 w-6 shrink-0 items-center justify-center"><DashboardIcon /></span> },
  { label: "Utilisateurs", to: "/utilisateurs", icon: <span className="flex h-6 w-6 shrink-0 items-center justify-center"><UsersIcon /></span> },
  { label: "Rapports",     to: "/rapports",     icon: <span className="flex h-6 w-6 shrink-0 items-center justify-center"><ReportsIcon /></span> },
  { label: "Paramètres",   to: "/settings",     icon: <span className="flex h-6 w-6 shrink-0 items-center justify-center"><SettingsIcon /></span> },
];

// ── Editable field ────────────────────────────────────────────────────────────

function EditableField({ label, initialValue }: { label: string; initialValue: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [draft, setDraft] = useState(initialValue);
  const inputId = useId();

  function handleSave() {
    setValue(draft);
    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(value);
    setIsEditing(false);
  }

  return (
    <div className="flex flex-col gap-2 border-b border-primary/10 py-5 lg:py-7">
      {isEditing ? (
        <>
          <label htmlFor={inputId} className="text-base font-semibold text-secondary lg:text-xl">
            {label}
          </label>
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <input
              id={inputId}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
              autoFocus
              className="flex-1 rounded-xl border border-primary/40 bg-white/5 px-4 py-2 text-base text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary lg:text-lg"
            />
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-secondary/60 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              Annuler
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-3 lg:gap-6">
            <span className="text-base font-semibold text-secondary whitespace-nowrap lg:text-xl">
              {label}
            </span>
            <span className="text-base font-semibold text-secondary lg:text-xl">{value}</span>
          </div>
          <button
            type="button"
            onClick={() => { setDraft(value); setIsEditing(true); }}
            className="w-fit text-sm text-secondary/60 underline decoration-solid text-left hover:text-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary lg:text-lg"
          >
            Modifier
          </button>
        </>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Utilisateurs() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarId = useId();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {/* Backdrop mobile */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/55 transition-opacity duration-300 lg:hidden",
          isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Header mobile flottant */}
      <header
        className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between px-5 pointer-events-none lg:hidden"
        aria-label="En-tête mobile"
      >
        <button
          type="button"
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isSidebarOpen}
          aria-controls={sidebarId}
          onClick={() => setIsSidebarOpen((o) => !o)}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
        <img
          src={`${import.meta.env.BASE_URL}/assets/image 5 (1).png`}
          alt="Logo Zbalah"
          className="pointer-events-auto h-9 w-auto object-contain"
        />
      </header>

      <div className="flex h-screen overflow-hidden bg-page-dark">

        {/* ── Sidebar ── */}
        <aside
          id={sidebarId}
          className={cn(
            "flex h-full w-72 shrink-0 flex-col border-r border-primary/20 bg-page-dark transition-transform duration-300 ease-out",
            "fixed inset-y-0 left-0 z-40",
            isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
            "lg:static lg:w-80 lg:translate-x-0 lg:shadow-none lg:transition-none"
          )}
          aria-label="Navigation admin"
        >
          <header className="border-b border-primary/20 px-8 py-8">
            <h2 className="text-2xl font-semibold text-secondary">Admin Panel</h2>
          </header>

          <nav className="flex-1 px-4 py-8" aria-label="Navigation admin">
            <ul className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.to}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(sidebarItemVariants({ active: isActive }))
                    }
                  >
                    {item.icon}
                    <span className="text-base font-medium leading-none">
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main
          className="flex flex-1 flex-col overflow-y-auto bg-fil px-6 pt-20 pb-8 lg:px-10 lg:pt-11 lg:pb-11"
          aria-label="Infos utilisateur"
        >
          {/* Page heading */}
          <header className="mb-8 flex items-start justify-between lg:mb-11">
            <h1 className="text-4xl font-semibold text-secondary lg:text-5xl">
              Infos{" "}
              <br className="lg:hidden" />
              <span className="text-primary">utilisateur</span>
            </h1>
            <img
              src={`${import.meta.env.BASE_URL}/assets/image 5 (1).png`}
              alt="Logo Zbalah"
              className="hidden h-14 w-auto object-contain lg:block"
            />
          </header>

          {/* Avatar */}
          <div className="mb-8 lg:mb-10">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/30 bg-primary/10 lg:h-36 lg:w-36">

              <AvatarIcon />
            </div>
          </div>

          {/* Info fields */}
          <div className="flex w-full max-w-xl flex-col">
            <EditableField label="Nom d'utilisateur :" initialValue="Alex Chen" />
            <EditableField label="Tag :" initialValue="@alexchen" />
            <EditableField label="Adresse email :" initialValue="alexchen@outlook.fr" />

            {/* Password — read-only */}
            <div className="flex flex-col gap-2 py-5 lg:py-7">
              <div className="flex flex-wrap items-baseline gap-3 lg:gap-6">
                <span className="text-base font-semibold text-secondary whitespace-nowrap lg:text-xl">
                  Mot de passe :
                </span>
                <span className="text-base font-semibold text-secondary tracking-[0.3em] lg:text-xl">
                  ●●●●●●●
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <InfoCircleIcon />
                <span className="text-sm text-secondary/60 lg:text-base">
                  Ne peut pas être modifier
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-full" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3"  y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-full" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-full" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-full" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1-.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function AvatarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 text-primary/50 lg:h-20 lg:w-20" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function InfoCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-secondary/60" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}
