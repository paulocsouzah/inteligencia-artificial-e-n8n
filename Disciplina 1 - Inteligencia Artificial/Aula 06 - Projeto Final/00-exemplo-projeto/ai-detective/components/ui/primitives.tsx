import type { ReactNode } from "react";
import clsx from "clsx";

// Primitivas visuais reaproveitadas em todos os painéis do dashboard —
// mantém o "clima" de laboratório forense consistente sem repetir classes
// Tailwind em todo componente.

export function Panel({
  children,
  className,
  noPadding,
}: {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-border bg-panel/80 backdrop-blur-sm",
        !noPadding && "p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  icon,
  title,
  action,
}: {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-1 pb-3">
      <h2 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
        {icon}
        {title}
      </h2>
      {action}
    </div>
  );
}

type Tone = "neutral" | "accent" | "danger" | "ok" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-white/5 text-ink-dim border-border",
  accent: "bg-accent-soft text-accent border-accent/30",
  danger: "bg-danger-soft text-danger border-danger/30",
  ok: "bg-ok-soft text-ok border-ok/30",
  info: "bg-info/10 text-info border-info/30",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide",
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone = "ok", pulse = true }: { tone?: Tone; pulse?: boolean }) {
  const dotColor: Record<Tone, string> = {
    neutral: "bg-ink-faint",
    accent: "bg-accent",
    danger: "bg-danger",
    ok: "bg-ok",
    info: "bg-info",
  };
  return <span className={clsx("h-2 w-2 rounded-full", dotColor[tone], pulse && "animate-pulse-dot")} />;
}

export function IconButton({
  children,
  onClick,
  title,
  active,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "border-accent/40 bg-accent-soft text-accent"
          : "border-border bg-white/[0.02] text-ink-dim hover:border-border-soft hover:text-ink hover:bg-white/[0.04]",
        className
      )}
    >
      {children}
    </button>
  );
}
