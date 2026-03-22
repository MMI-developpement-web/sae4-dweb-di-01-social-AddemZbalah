import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { NavLink } from "react-router-dom";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";
import DashboardDetails from "../ui/Dashboard/dashboardDetails";

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

// ── Stat cards data ──────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    id: "profil-views",
    icon: <UsersIcon />,
    label: "Total Utilisateurs qui ont vu votre profil",
    value: "12,543",
  },
  {
    id: "posts-month",
    icon: <TrendingIcon />,
    label: "Nombre de posts ce mois-ci",
    value: "68",
  },
  {
    id: "time-spent",
    icon: <ClockIcon />,
    label: "Nombre total d'heure passé sur l'app",
    value: "68.4H",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
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
          src={`${import.meta.env.BASE_URL}assets/image 5 (1).png`}
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
            // Mobile : drawer fixed
            "fixed inset-y-0 left-0 z-40",
            isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
            // Desktop : static en flux
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
          aria-label="Tableau de bord"
        >
          {/* Page heading */}
          <header className="mb-8 flex items-start justify-between lg:mb-11">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-semibold text-secondary lg:text-5xl">
                Tableau de{" "}
                <span className="text-primary">bord</span>
              </h1>
              <p className="text-base text-secondary/60 lg:text-lg">
                Vue d'ensemble de votre plateforme
              </p>
            </div>
            <img
              src={`${import.meta.env.BASE_URL}assets/image 5 (1).png`}
              alt="Logo Zbalah"
              className="hidden h-14 w-auto object-contain lg:block"
            />
          </header>

          <section
            className="grid grid-cols-1 gap-5 lg:gap-6 lg:grid-cols-3"
            aria-label="Statistiques"
          >
            {STAT_CARDS.map((card) => (
              <DashboardDetails
                key={card.id}
                icon={card.icon}
                label={card.label}
                value={card.value}
              />
            ))}
          </section>
        </main>
      </div>
    </>
  );
}



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
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-full" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-full" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
