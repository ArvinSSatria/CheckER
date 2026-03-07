"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatNumber";
import { Info, ShieldCheck, DollarSign, FileText, ExternalLink } from "lucide-react";

interface CreatorProfileCardProps {
  username: string;
  followers: number;
  profilePicture?: string;
  postsAnalyzed?: number;
  estimatedPostValue?: { min: number; max: number };
}

export function CreatorProfileCard({ username, followers, profilePicture, postsAnalyzed, estimatedPostValue }: CreatorProfileCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Card className="w-full h-full rounded-2xl border border-border bg-card soft-shadow group transition-all duration-300">
      <CardContent className="p-8 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 h-full">
        {/* Avatar */}
        <div className="relative">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-background soft-shadow">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={`${username} profile`}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <span className="text-4xl font-bold text-muted-foreground/50 uppercase">
                  {username.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            <a
              href={`https://www.tiktok.com/@${username.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 group/link hover:opacity-80 transition-opacity"
            >
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {username.startsWith("@") ? username : `@${username}`}
              </h2>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </a>
            <ShieldCheck className="h-5 w-5 text-blue-500/80 fill-blue-500/5" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center rounded-full bg-secondary/50 px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              TikTok Creator
            </span>
            {/* Info icon with tooltip */}
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center bg-muted/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-help border border-border/30">
                <Info className="h-3.5 w-3.5" />
              </div>

              {/* Tooltip */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-72 p-4 rounded-xl bg-card border border-border shadow-lg z-[100] transition-all duration-200 ${
                  showTooltip
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-1 pointer-events-none"
                }`}
              >
                <div className="space-y-2.5 text-left">
                  <p className="text-xs font-bold text-foreground">How is this calculated?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Data is collected from the <span className="font-semibold text-foreground">latest {postsAnalyzed || 9} posts</span> of this TikTok account.
                  </p>
                  <div className="p-2.5 rounded-lg bg-background border border-border/50">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1">Engagement Rate Formula:</p>
                    <p className="text-xs font-mono font-bold text-foreground leading-relaxed">
                      ((Avg Likes + Avg Comments + Avg Shares) / Avg Views) × 100
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                    Based on the HypeAuditor method using views as the denominator instead of followers.
                  </p>
                </div>
                {/* Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="w-full pt-5 border-t border-border/50 space-y-5">
          {/* Followers */}
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-foreground tracking-tight">
              {formatNumber(followers)}
            </span>
            <span className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">
              Total Followers
            </span>
          </div>

          {/* Extra Stats Row */}
          {((postsAnalyzed !== undefined && postsAnalyzed > 0) || (estimatedPostValue && estimatedPostValue.max > 0)) && (
            <div className="grid grid-cols-2 gap-3">
              {postsAnalyzed !== undefined && postsAnalyzed > 0 && (
                <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-background/80 border border-border/30">
                  <FileText className="h-4 w-4 text-muted-foreground/60" />
                  <span className="text-2xl font-bold text-foreground tracking-tight">{postsAnalyzed}</span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Posts</span>
                </div>
              )}
              {estimatedPostValue && estimatedPostValue.max > 0 && (
                <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-background/80 border border-border/30">
                  <DollarSign className="h-4 w-4 text-muted-foreground/60" />
                  <span className="text-lg font-bold text-foreground tracking-tight">
                    ${formatNumber(estimatedPostValue.min)}-{formatNumber(estimatedPostValue.max)}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Est. Value</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
