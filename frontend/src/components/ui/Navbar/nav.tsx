import type { ReactElement } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import { logout } from "../../../lib/api";

const navItemVariants = cva(
	"flex items-center gap-4 rounded-xl px-4 py-4 text-secondary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
	{
		variants: {
			active: {
				true: "bg-primary text-primary-foreground",
				false: "hover:bg-secondary/10",
			},
		},
		defaultVariants: {
			active: false,
		},
	},
);

const navContainerVariants = cva(
	"flex h-screen w-80 flex-col border-r border-primary/20 bg-page-dark",
	{
		variants: {
			mode: {
				embedded: "",
				overlay: "shadow-2xl",
			},
			
			position: {
				drawer:
					"fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-out lg:static lg:inset-y-auto lg:z-auto lg:translate-x-0 lg:shadow-none lg:transition-none",
				static: "static",
			},
	
			drawerState: {
				open: "translate-x-0 shadow-2xl",
				closed: "-translate-x-full",
			},
		},
		defaultVariants: {
			mode: "embedded",
			position: "static",
			drawerState: "closed",
		},
	},
);

const navHeaderVariants = cva("border-b border-primary/20 px-8 py-8");
const navLogoVariants = cva("h-10 w-auto object-contain");
const navContentVariants = cva("flex-1 px-4 py-8");
const navListVariants = cva("space-y-2");
const navIconVariants = cva("h-6 w-6");
const navLabelVariants = cva("text-base font-medium leading-none");
const navFooterVariants = cva("h-24 border-t border-primary/20 flex flex-col justify-center px-4");
const navLogoutBtnVariants = cva(
	"flex w-full cursor-pointer items-center gap-4 rounded-xl px-4 py-4 text-purple-200 transition-colors duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
);

type NavItem = {
	label: string;
	to: string;
	icon: (props: { className?: string }) => ReactElement;
};

const navItems: NavItem[] = [
	{ label: "Mon Fil", to: "/fil", icon: UsersIcon },
	{ label: "Dashboard", to: "/dashboard", icon: DashboardIcon },
	{ label: "Poster", to: "/add-post", icon: PostIcon },
	{ label: "Profil", to: "/profil", icon: ProfileIcon },
	{ label: "Parametres", to: "/settings", icon: SettingsIcon },
];

interface NavProps {
	id?: string;
	onNavigate?: () => void;
	mode?: VariantProps<typeof navContainerVariants>["mode"];
	position?: VariantProps<typeof navContainerVariants>["position"];
	drawerState?: VariantProps<typeof navContainerVariants>["drawerState"];
        className?: string;
}

export default function Nav({ id, onNavigate, mode, position, drawerState, className }: NavProps) {
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/connexion");
	};

	return (
		<aside id={id} className={cn(navContainerVariants({ mode, position, drawerState }), className)}>
			<header className={cn(navHeaderVariants())}>
				<img
					src={`${import.meta.env.BASE_URL}assets/image 5 (1).png`}
					alt="Logo Zbalah"
					className={cn(navLogoVariants())}
				/>
			</header>

			<nav className={cn(navContentVariants())} aria-label="Navigation principale">
				<ul className={cn(navListVariants())}>
					{navItems.map((item) => (
						<li key={item.label}>
							<NavLink
								to={item.to}
								onClick={onNavigate}
								className={({ isActive }) => cn(navItemVariants({ active: isActive }))}
							>
								<item.icon className={cn(navIconVariants())} />
								<span className={cn(navLabelVariants())}>{item.label}</span>
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			<footer className={cn(navFooterVariants())}>
				<button 
					type="button" 
					onClick={handleLogout}
					className={cn(navLogoutBtnVariants())}
					aria-label="Se déconnecter"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className={cn(navIconVariants())}
						aria-hidden="true"
					>
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
						<polyline points="16 17 21 12 16 7" />
						<line x1="21" y1="12" x2="9" y2="12" />
					</svg>
					<span className={cn(navLabelVariants())}>Déconnexion</span>
				</button>
			</footer>
		</aside>
	);
}

function UsersIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			className={className}
			aria-hidden="true"
		>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.9" />
			<path d="M16 3.1a4 4 0 0 1 0 7.8" />
		</svg>
	);
}

function DashboardIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			className={className}
			aria-hidden="true"
		>
			<rect x="3" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="14" width="7" height="7" rx="1" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
		</svg>
	);
}

function PostIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			className={className}
			aria-hidden="true"
		>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<path d="M14 2v6h6" />
			<path d="M16 13H8" />
			<path d="M16 17H8" />
			<path d="M10 9H8" />
		</svg>
	);
}

function SettingsIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			className={className}
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
		</svg>
	);
}

function ProfileIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			className={className}
			aria-hidden="true"
		>
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	);
}

export { Nav };
