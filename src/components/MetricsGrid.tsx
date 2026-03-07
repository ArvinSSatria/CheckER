import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatNumber";
import { Eye, Heart, MessageCircle, Share2, Percent, LucideIcon } from "lucide-react";

interface MetricsGridProps {
  averageViews?: number;
  averageLikes: number;
  averageComments: number;
  averageShares?: number;
  commentToLikeRatio?: string;
}

export function MetricsGrid({ averageViews, averageLikes, averageComments, averageShares, commentToLikeRatio }: MetricsGridProps) {
  const isTikTok = averageViews !== undefined;

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className={`grid grid-cols-2 ${isTikTok ? 'lg:grid-cols-4' : 'lg:grid-cols-2 max-w-2xl mx-auto'} gap-4`}>
        {averageViews !== undefined && (
          <MetricCard label="Avg Views" value={averageViews} icon={Eye} />
        )}
        <MetricCard label="Avg Likes" value={averageLikes} icon={Heart} />
        <MetricCard label="Avg Comments" value={averageComments} icon={MessageCircle} />
        {averageShares !== undefined && (
          <MetricCard label="Avg Shares" value={averageShares} icon={Share2} />
        )}
      </div>

      {/* Ratio Insights */}
      {commentToLikeRatio && (
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-2xl border border-border bg-card soft-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-background border border-border/50 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Comment-to-Like Ratio</p>
                  <p className="text-sm text-muted-foreground/60 mt-0.5">How often likes convert to comments</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-foreground tracking-tight">{commentToLikeRatio}%</span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <Card className="rounded-2xl border border-border bg-card soft-shadow hover:shadow-md transition-all duration-300 overflow-hidden group">
      <CardContent className="p-7 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground transition-colors duration-300" />
          </div>
          <div className="h-2 w-2 rounded-full bg-border/40 group-hover:bg-primary/20 transition-colors" />
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {formatNumber(value)}
          </p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
