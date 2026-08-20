"use client";

import { useTransition } from "react";
import { signOutAction } from "@/app/login/actions";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  variant?: "ghost" | "outline" | "danger" | "default";
}

export default function SignOutButton({
  className = "",
  children,
  showIcon = true,
  variant = "ghost",
}: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer select-none";

  const variantStyles = {
    ghost:
      "text-muted hover:text-foreground hover:bg-surface-hover px-2.5 py-1.5",
    outline:
      "border border-border text-muted hover:text-foreground hover:border-border-hover hover:bg-surface-hover px-3 py-1.5",
    danger:
      "text-error border border-error/20 hover:bg-error/10 hover:border-error/40 px-3 py-1.5",
    default:
      "bg-surface border border-border text-foreground hover:bg-surface-hover px-3 py-1.5",
  };

  const selectedVariantStyle = variantStyles[variant] || variantStyles.ghost;

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await signOutAction();
        });
      }}
      disabled={isPending}
      aria-label="Sign out"
      className={`${baseStyles} ${selectedVariantStyle} ${className}`}
    >
      {isPending ? (
        <>
          <svg
            className="size-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span>Signing out...</span>
        </>
      ) : (
        <>
          {showIcon && (
            <svg
              className="size-4 shrink-0 opacity-80"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          )}
          {children || <span>Sign Out</span>}
        </>
      )}
    </button>
  );
}
