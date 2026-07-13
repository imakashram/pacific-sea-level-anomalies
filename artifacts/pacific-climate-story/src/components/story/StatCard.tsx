import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  description?: string;
  className?: string;
}

export function StatCard({ label, value, description, className = "" }: StatCardProps) {
  return (
    <div className={`p-6 border border-border/50 bg-card/30 backdrop-blur-sm rounded-lg flex flex-col gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-4xl md:text-5xl font-serif text-primary font-bold">{value}</span>
      {description && <span className="text-sm text-foreground/80 mt-1">{description}</span>}
    </div>
  );
}
