import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonLoginVariants = cva(
  "w-auto inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        lavender:
          "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground focus:ring-secondary",
        primary: "bg-primary text-primary-foreground hover:opacity-80 focus:ring-primary",
        secondary:
          "bg-background text-foreground border border-border hover:bg-primary hover:text-primary-foreground focus:ring-ring",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "lavender",
      size: "lg",
    },
  },
);

interface ConnexionBtnProps extends VariantProps<typeof buttonLoginVariants> {
  children: ReactNode;
}

export default function ConnexionBtn({
  children,
  variant,
  size,
  className,
  ...props
}: ConnexionBtnProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(buttonLoginVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}

export { ConnexionBtn };