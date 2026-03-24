import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import type { ReactNode } from "react";

const verificationItemVariants = cva(
  "flex items-center gap-1.5 transition-all duration-300",
  {
    variants: {
      status: {
        valid: "opacity-100",
        invalid: "opacity-60",
      },
    },
    defaultVariants: {
      status: "invalid",
    },
  },
);

interface ConnexionVerifProps extends VariantProps<typeof verificationItemVariants> {
  children: ReactNode;
  icon?: string;
  ariaLabel?: string;
}

export default function ConnexionVerif({
  children,
  status,
  icon = `${import.meta.env.BASE_URL}/assets/Check circle.svg`,
  ariaLabel,
}: ConnexionVerifProps) {
  return (
    <div
      className={cn(verificationItemVariants({ status }))}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center overflow-hidden rounded-full">
        <img
          src={icon}
          alt=""
          className="max-w-none size-full"
          aria-hidden="true"
        />
      </div>
      <p className="text-[0.65rem] font-semibold leading-tight text-secondary">
        {children}
      </p>
    </div>
  );
}

export { ConnexionVerif };
