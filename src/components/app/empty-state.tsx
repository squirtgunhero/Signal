import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: Route;
  secondary?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, actionHref, secondary }: EmptyStateProps) {
  return (
    <Card className="overflow-hidden bg-[#fffaf0]">
      <CardHeader>
        <p className="brand-kicker">Workspace Gate</p>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="max-w-2xl text-base leading-7">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {actionLabel && actionHref ? (
          <Button asChild>
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        ) : null}
        {secondary ? <div className="max-w-xl text-sm leading-6 text-muted-foreground">{secondary}</div> : null}
      </CardContent>
    </Card>
  );
}