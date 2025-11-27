import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface QuickStatsProps {
  title: string;
  value: number;
  subtitle: string;
  icon?: LucideIcon;
  trend?: string;
}

export const QuickStats = ({ title, value, subtitle, icon: Icon, trend }: QuickStatsProps) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm text-muted-foreground">{title}</div>
        {Icon && <Icon className="h-5 w-5 text-primary" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      </div>
      {trend && (
        <div className="mt-2 text-xs text-success">
          {trend}
        </div>
      )}
    </Card>
  );
};
