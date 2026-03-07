import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Award } from "lucide-react";
import type { EngagementQuality } from "@/lib/engagementCalculator";

interface EngagementCardProps {
  engagementRate: string;
  quality: EngagementQuality;
}

const gradeColors: Record<string, string> = {
  "A+": "text-emerald-600 dark:text-emerald-400",
  "A": "text-green-600 dark:text-green-400",
  "B": "text-blue-600 dark:text-blue-400",
  "C": "text-amber-600 dark:text-amber-400",
  "D": "text-red-500 dark:text-red-400",
};

export function EngagementCard({ engagementRate, quality }: EngagementCardProps) {
  return (
    <Card className="relative overflow-hidden group rounded-2xl border border-border bg-card soft-shadow h-full flex flex-col justify-center transition-all duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(138,132,117,0.05),transparent)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02),transparent)]" />

      <CardContent className="relative p-10 sm:p-14 flex flex-col items-center justify-center text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/30 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <TrendingUp className="h-4 w-4" />
          <span>Net Engagement Rate</span>
        </div>

        {/* Rate */}
        <div className="relative">
          <h1 className="relative text-7xl sm:text-8xl md:text-9xl font-bold tracking-tight text-foreground leading-none flex items-baseline justify-center">
            {engagementRate}
            <span className="text-muted-foreground/30 font-bold text-4xl sm:text-5xl ml-1">%</span>
          </h1>
        </div>

        {/* Grade + Quality */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg bg-background border border-border/50 ${gradeColors[quality.grade]}`}>
              <Award className="h-4 w-4" />
              <span className="text-sm font-black tracking-wide">Grade {quality.grade}</span>
            </div>
            <span className="text-base font-bold text-foreground/80">{quality.label}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md opacity-70">
            {quality.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
