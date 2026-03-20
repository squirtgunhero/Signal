import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
  className?: string;
};

export function PageHero({ eyebrow, title, description, aside, className }: PageHeroProps) {
  return (
    <section className={cn("grid gap-6 rounded-[32px] border border-[#2f3a36] bg-[#161a19] p-8 text-[#f7f1e4] shadow-[0_24px_70px_rgba(7,9,8,0.34)] lg:grid-cols-[1.3fr_0.7fr]", className)}>
      <div className="space-y-4">
        <Badge variant="secondary" className="w-fit border border-white/10 bg-white/5 text-[#f7f1e4]">
          {eyebrow}
        </Badge>
        <div className="space-y-3">
          <h1 className="max-w-3xl text-4xl leading-tight text-[#f7f1e4] md:text-5xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-7 text-[#d3cdbc] md:text-base">{description}</p>
        </div>
      </div>
      {aside ? <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">{aside}</div> : null}
    </section>
  );
}