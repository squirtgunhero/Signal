"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ChartDatum = {
  label: string;
  value: number;
};

type VisibilityOverviewChartProps = {
  data: ChartDatum[];
};

export function VisibilityOverviewChart({ data }: VisibilityOverviewChartProps) {
  return (
    <div className="h-52 w-full rounded-[24px] border border-border bg-background px-2 py-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(119,108,92,0.22)" />
          <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} allowDecimals={false} fontSize={12} />
          <Tooltip cursor={{ fill: "rgba(22,26,25,0.05)" }} contentStyle={{ borderRadius: 16, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }} />
          <Bar dataKey="value" radius={[8, 8, 4, 4]} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
