import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatNumber";
import { Eye, Heart, MessageCircle, Share2, Percent, LucideIcon } from "lucide-react";

interface MetricsWidgetsProps {
  averageViews?: number;
  averageLikes: number;
  averageComments: number;
  averageShares?: number;
  likeToViewRatio?: string;
  commentToLikeRatio?: string;
  shareToViewRatio?: string;
}

export function MetricsWidgets({
  averageViews,
  averageLikes,
  averageComments,
  averageShares,
  likeToViewRatio,
  commentToLikeRatio,
  shareToViewRatio,
}: MetricsWidgetsProps) {
  const isTikTok = averageViews !== undefined;

  const ratios = [
    likeToViewRatio && { label: "Like-to-View Ratio", value: likeToViewRatio, hint: "Percentage of viewers who liked" },
    commentToLikeRatio && { label: "Comment-to-Like Ratio", value: commentToLikeRatio, hint: "How often likes convert to comments" },
    shareToViewRatio && { label: "Share-to-View Ratio", value: shareToViewRatio, hint: "Virality indicator per view" },
  ].filter(Boolean) as { label: string; value: string; hint: string }[];

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className={`grid grid-cols-2 ${isTikTok ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-4`}>
        {averageViews !== undefined && (
          <MetricWidget label="Avg Views" value={averageViews} icon={Eye} />
        )}
        <MetricWidget label="Avg Likes" value={averageLikes} icon={Heart} />
        <MetricWidget label="Avg Comments" value={averageComments} icon={MessageCircle} />
        {averageShares !== undefined && (
          <MetricWidget label="Avg Shares" value={averageShares} icon={Share2} />
        )}
      </div>

      {/* Ratio Insights */}
      {ratios.length > 0 && (
        <div className={`grid grid-cols-1 ${ratios.length >= 3 ? 'lg:grid-cols-3' : ratios.length === 2 ? 'lg:grid-cols-2' : ''} gap-4`}>
          {ratios.map((ratio) => (
            <Card key={ratio.label} className="rounded-2xl border border-border bg-card soft-shadow">
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-background border border-border/50 flex items-center justify-center">
                    <Percent className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{ratio.label}</p>
                    <p className="text-sm text-muted-foreground/50 mt-0.5 truncate">{ratio.hint}</p>
                  </div>
                </div>
                <span className="flex-shrink-0 text-3xl font-bold text-foreground tracking-tight">{ratio.value}%</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricWidget({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
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
