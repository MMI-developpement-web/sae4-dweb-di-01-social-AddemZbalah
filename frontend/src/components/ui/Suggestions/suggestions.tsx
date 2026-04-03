import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import ConnexionBtn from "../Button/Connexion-Inscription_Btn";

const FALLBACK_AVATAR = "https://www.figma.com/api/mcp/asset/db2a1971-280d-4846-b397-f3d516d1f6a4";

const suggestionsCardVariants = cva(
	"flex w-full flex-col rounded-lg border px-6 py-5",
	{
		variants: {
			size: {
				md: "gap-2",
				lg: "gap-3",
			},
			cardVariant: {
				default: "border-primary bg-page-dark",
				soft: "border-primary/70 bg-page-dark/95",
			},
		},
		defaultVariants: {
			size: "md",
			cardVariant: "default",
		},
	}
);

const titleVariants = cva("font-semibold text-secondary", {
	variants: {
		size: {
			md: "text-2xl leading-tight",
			lg: "text-3xl leading-tight",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

const suggestionRowVariants = cva(
	"flex w-full items-center justify-between gap-4",
	{
		variants: {
			rowDensity: {
				default: "py-5",
				compact: "py-3",
			},
		},
		defaultVariants: {
			rowDensity: "default",
		},
	}
);

export interface SuggestionUser {
	id: string;
	name: string;
	handle: string;
	avatar?: string;
	ctaLabel?: string;
}

interface SuggestionsProps
	extends VariantProps<typeof suggestionsCardVariants>,
		VariantProps<typeof suggestionRowVariants> {
	title?: string;
	followVariant?: "lavender" | "secondary" | "primary";
	followSize?: "sm" | "md" | "lg";
	suggestions?: SuggestionUser[];
	onFollow?: (user: SuggestionUser) => void;
}

const DEFAULT_SUGGESTIONS: SuggestionUser[] = [
	{
		id: "marie-dubois-1",
		name: "Marie Dubois",
		handle: "marie_d_design",
		avatar: FALLBACK_AVATAR,
		ctaLabel: "Suivre",
	},
	{
		id: "marie-dubois-2",
		name: "Marie Dubois",
		handle: "marie_d_design",
		avatar: FALLBACK_AVATAR,
		ctaLabel: "Suivre",
	},
];

export default function Suggestions({
	title = "Suggestions",
	size,
	cardVariant,
	rowDensity,
	followVariant = "lavender",
	followSize = "sm",
	suggestions = DEFAULT_SUGGESTIONS,
	onFollow,
}: SuggestionsProps) {
	return (
		<aside className={cn(suggestionsCardVariants({ size, cardVariant }))} aria-label={title}>
			<h2 className={cn(titleVariants({ size }))}>{title}</h2>

			<ul className="flex w-full flex-col" role="list">
				{suggestions.map((user) => (
					<li key={user.id} className={cn(suggestionRowVariants({ rowDensity }))}>
						<header className="flex min-w-0 items-center gap-4">
							<img
								src={user.avatar || FALLBACK_AVATAR}
								alt={user.name}
								className="h-14 w-14 shrink-0 rounded-full object-cover"
							/>
							<hgroup className="min-w-0">
								<p className="truncate text-lg font-semibold leading-tight text-secondary">
									{user.name}
								</p>
								<p className="truncate text-base text-secondary/60">@{user.handle}</p>
							</hgroup>
						</header>

						<ConnexionBtn
							type="button"
							variant={followVariant}
							size={followSize}
							onClick={() => onFollow?.(user)}
							aria-label={`Suivre ${user.name}`}
						>
							{user.ctaLabel || "Suivre"}
						</ConnexionBtn>
					</li>
				))}
			</ul>
		</aside>
	);
}

export { Suggestions };
