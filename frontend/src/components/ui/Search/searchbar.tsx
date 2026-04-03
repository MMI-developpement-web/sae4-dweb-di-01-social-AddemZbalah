import { cva, type VariantProps } from "class-variance-authority";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../../lib/utils";

const searchbarContainerVariants = cva(
	"flex w-full items-center overflow-hidden rounded-full border transition-all duration-300",
	{
		variants: {
			variant: {
				default: "border-secondary/80 bg-black/5",
				subtle: "border-primary/70 bg-page-dark/40",
			},
			size: {
				sm: "h-12 gap-2 px-4",
				md: "h-14 gap-3 px-5",
				lg: "h-16 gap-4 px-5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "lg",
		},
	}
);

const searchbarIconVariants = cva("shrink-0 text-secondary", {
	variants: {
		size: {
			sm: "h-6 w-6",
			md: "h-7 w-7",
			lg: "h-8 w-8",
		},
	},
	defaultVariants: {
		size: "lg",
	},
});

const searchbarInputVariants = cva(
	"w-full bg-transparent text-secondary placeholder:text-secondary/90 focus:outline-none",
	{
		variants: {
			size: {
				sm: "text-base font-medium",
				md: "text-lg font-semibold",
				lg: "text-xl font-semibold",
			},
		},
		defaultVariants: {
			size: "lg",
		},
	}
);

interface SearchbarProps
	extends VariantProps<typeof searchbarContainerVariants> {
	placeholder?: string;
}

export default function Searchbar({
	variant,
	size,
	placeholder = "Rechercher",
	...props
}: SearchbarProps & InputHTMLAttributes<HTMLInputElement>) {
	return (
		<label className={cn(searchbarContainerVariants({ variant, size }))} aria-label="Rechercher">
			<svg
				className={cn(searchbarIconVariants({ size }))}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="7" />
				<line x1="16.65" y1="16.65" x2="21" y2="21" />
			</svg>

			<input
				type="search"
				className={cn(searchbarInputVariants({ size }))}
				placeholder={placeholder}
				{...props}
			/>
		</label>
	);
}

export { Searchbar };
