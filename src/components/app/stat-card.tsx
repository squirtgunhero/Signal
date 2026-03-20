import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, detail, icon }: StatCardProps) {
  return (
    <Card className="bg-[#fffaf0]">
      <CardContent className="flex items-start justify-between gap-6 p-6">
        <div className="space-y-2">
          <p className="brand-kicker">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
        </div>
        {icon ? <div className="rounded-full border border-border bg-background p-3 text-primary">{icon}</div> : null}
      </CardContent>
    </Card>
  );
}