import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";
import type { InputHTMLAttributes } from "react";

const inputVariants = cva(
  "w-full inline-flex items-center rounded-lg font-normal transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-secondary/70",
  {
    variants: {
      variant: {
        dark: "bg-primary/5 text-secondary border border-secondary/50 focus:ring-secondary focus:border-secondary",
        light: "text-foreground border border-border placeholder:text-muted-foreground bg-input-background",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "light",
      size: "lg",
    },
  },
);

interface InputLoginProps extends VariantProps<typeof inputVariants> {
  placeholder?: string;
  type?: string;
}

export default function InputLogin({
  variant,
  size,
  type = "text",
  placeholder,
  ...props
}: InputLoginProps & Omit<InputHTMLAttributes<HTMLInputElement>, keyof InputLoginProps>) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={cn(inputVariants({ variant, size }))}
      {...props}
    />
  );
}

export { InputLogin };