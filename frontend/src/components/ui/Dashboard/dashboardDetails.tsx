import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";


const statCardVariants = cva(
  "flex flex-col rounded-3xl border border-primary/20 bg-page-dark",
  {
    variants: {
      size: {
        sm: "gap-3 px-6 py-4",
        md: "gap-4 px-8 py-5",
      },
    },
    defaultVariants: { size: "md" },
  }
);


const iconContainerVariants = cva(
  "flex shrink-0 items-center justify-center rounded-xl bg-primary/10",
  {
    variants: {
      size: {
        sm: "h-14 w-14",
        md: "h-16 w-16",
      },
    },
    defaultVariants: { size: "md" },
  }
);

const iconWrapperVariants = cva("text-primary", {
  variants: {
    size: {
      sm: "h-7 w-7",
      md: "h-8 w-8",
    },
  },
  defaultVariants: { size: "md" },
});


const labelVariants = cva("font-medium leading-snug text-secondary/70", {
  variants: {
    size: {
      sm: "text-base",
      md: "text-base",
    },
  },
  defaultVariants: { size: "md" },
});

const valueVariants = cva("font-semibold leading-none text-secondary", {
  variants: {
    size: {
      sm: "text-3xl",
      md: "text-4xl",
    },
  },
  defaultVariants: { size: "md" },
});


interface StatCardProps extends VariantProps<typeof statCardVariants> {
  icon?: ReactNode;
  label: string;
  value: string | number;
}

export default function DashboardDetails({
  icon = <DefaultUsersIcon />,
  label,
  value,
  size,
}: StatCardProps) {
  return (
    <article className={cn(statCardVariants({ size }))}>
      <div className={cn(iconContainerVariants({ size }))}>
        <div className={cn(iconWrapperVariants({ size }))} aria-hidden="true">
          {icon}
        </div>
      </div>

      <p className={cn(labelVariants({ size }))}>{label}</p>

      <p className={cn(valueVariants({ size }))}>{value}</p>
    </article>
  );
}


function DefaultUsersIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
}

export { DashboardDetails };
