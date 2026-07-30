"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMagneticHover } from "@/lib/hooks/useMagneticHover";
import { useRipple } from "@/lib/hooks/useRipple";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">,
    Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  /** If provided, renders as a Next.js Link instead of a <button>. */
  href?: string;
  /** Shows an inline spinner and disables interaction. */
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-accent-hover to-accent text-bg-base hover:shadow-glow-accent",
  secondary:
    "bg-transparent text-text-primary border border-border hover:border-border-strong",
  ghost: "bg-transparent text-text-secondary hover:text-text-primary",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "text-body-sm px-4 py-3",
  lg: "text-body px-5 py-4",
};

const baseStyles =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md font-medium " +
  "transition-[transform,box-shadow,border-color] duration-base ease-out hover:scale-[1.03] active:scale-[0.97] " +
  "disabled:opacity-40 disabled:pointer-events-none";

/**
 * Single primary CTA per screen is the design-system rule (see design
 * spec §1.9) — this component doesn't enforce that at runtime, but
 * every page composition should respect it.
 *
 * Primary buttons get a very subtle magnetic-hover nudge (desktop only,
 * reduced-motion aware — see useMagneticHover) and a click ripple
 * (useRipple) — both are shared hooks so any future button-like
 * component can reuse the same interactions rather than reimplementing
 * them.
 */
export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  href,
  target,
  rel,
  isLoading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const magneticRef = useMagneticHover<HTMLElement>(6);
  const handleRipple = useRipple();
  const isMagnetic = variant === "primary";

  const classes = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const content = (
    <>
      {isLoading && <ButtonSpinner />}
      <span className={cn(isLoading && "opacity-70")}>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link
        ref={isMagnetic ? (magneticRef as React.Ref<HTMLAnchorElement>) : undefined}
        href={href}
        target={target}
        rel={rel}
        onPointerDown={handleRipple}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={isMagnetic ? (magneticRef as React.Ref<HTMLButtonElement>) : undefined}
      className={classes}
      onPointerDown={handleRipple}
      disabled={disabled || isLoading}
      {...rest}
    >
      {content}
    </button>
  );
}

function ButtonSpinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <path
        d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
