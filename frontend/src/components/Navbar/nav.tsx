import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

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

type NavItem = {
	label: string;
	to: string;
	icon: (props: { className?: string }) => ReactElement;
};

const navItems: NavItem[] = [
	{ label: "Mon Fil", to: "/fil", icon: UsersIcon },
	{ label: "Dashboard", to: "/dashboard", icon: DashboardIcon },
	{ label: "Poster", to: "/add-post", icon: PostIcon },
	{ label: "Parametres", to: "/settings", icon: SettingsIcon },
];

export default function Nav() {
	return (
		<aside className="flex h-screen w-80 flex-col border-r border-primary/20 bg-background">
			<header className="border-b border-primary/20 px-8 py-8">
				<img
					src="/assets/image 5 (1).png"
					alt="Logo Zbalah"
					className="h-10 w-auto object-contain"
				/>
			</header>

			<nav className="flex-1 px-4 py-8" aria-label="Navigation principale">
				<ul className="space-y-2">
					{navItems.map((item) => (
						<li key={item.label}>
							<NavLink
								to={item.to}
								className={({ isActive }) => cn(navItemVariants({ active: isActive }))}
							>
								<item.icon className="h-6 w-6" />
								<span className="text-3xl font-medium leading-none">{item.label}</span>
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			<footer className="h-24 border-t border-primary/20" aria-hidden="true" />
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

export { Nav };
