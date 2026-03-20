import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-muted-foreground">{hint}</span> : null}
    </label>
  );
}