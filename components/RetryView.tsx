import type { LucideIcon } from "lucide-react";
import { Camera } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  icon: LucideIcon;
  title: string;
  buttonLabel: string;
  onRetry: () => void;
  children?: ReactNode;
}

// Shared screen for "couldn't read", "not a work document" and errors: what happened, one way forward.
export function RetryView({ icon: Icon, title, buttonLabel, onRetry, children }: Props) {
  return (
    <section role="alert" className="mx-auto flex max-w-xl flex-col items-center text-center">
      <span className="stamp grid size-20 place-items-center rounded-full bg-paper shadow-sm ring-1 ring-ink/10">
        <Icon aria-hidden className="size-10 text-ink" />
      </span>
      <h1 className="mt-6 text-[1.75rem] font-bold leading-tight">{title}</h1>
      <button
        type="button"
        onClick={onRetry}
        className="pressable mt-8 flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-ink px-5 text-xl font-bold text-paper"
      >
        <Camera aria-hidden className="size-6" />
        {buttonLabel}
      </button>
      {children && <div className="mt-8 w-full text-left">{children}</div>}
    </section>
  );
}
