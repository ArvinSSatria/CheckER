"use client";

import { useState, useRef, useCallback } from "react";
import { SearchBar } from "@/components/SearchBar";
import { CreatorProfileCard } from "@/components/CreatorProfileCard";
import { EngagementDisplay } from "@/components/EngagementDisplay";
import { MetricsWidgets } from "@/components/MetricsWidgets";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { ManualInputForm } from "@/components/ManualInputForm";
import { Toast } from "@/components/Toast";
import { calculateTikTokEngagement } from "@/lib/engagementCalculator";
import { Sparkles, Download, Copy } from "lucide-react";

export default function TikTokCalculatorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchFailed, setSearchFailed] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [data, setData] = useState<{
    profile: any;
    stats: any;
  } | null>(null);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" });
  const [exporting, setExporting] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ visible: true, message, type });
  }, []);

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      showToast("Analytics JSON copied to clipboard");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const handleExportPNG = async () => {
    if (!resultsRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `tiktok-report-${data?.profile?.username || "unknown"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Report exported as PNG");
    } catch {
      showToast("Failed to export image", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleSearch = async (username: string) => {
    setIsLoading(true);
    setError("");
    setSearchFailed(false);
    setData(null);
    setCurrentUsername(username);

    try {
      const response = await fetch("/api/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
           setError((result && result.error) || "Failed to fetch profile");
           setSearchFailed(true);
           return;
      }

      const stats = calculateTikTokEngagement({
        viewsArray: result.views,
        likesArray: result.likes,
        commentsArray: result.comments,
        sharesArray: result.shares,
        followers: result.followers,
      });

      setData({
        profile: result,
        stats,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setSearchFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualCalculate = (manualData: any) => {
    const stats = calculateTikTokEngagement({
        viewsArray: manualData.viewsArray,
        likesArray: manualData.likesArray,
        commentsArray: manualData.commentsArray,
        sharesArray: manualData.sharesArray,
        followers: parseInt(manualData.followers) || undefined,
      });

      setData({
        profile: {
            username: manualData.username,
            followers: manualData.followers,
            profilePicture: null
        },
        stats,
      });
      setError("");
      setSearchFailed(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-20 h-full w-full bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8B735508_1px,transparent_1px),linear-gradient(to_bottom,#8B735508_1px,transparent_1px)] bg-[size:32px_32px] bg-grid-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(139,115,85,0.05)_0,transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(212,197,173,0.03)_0,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-24 md:py-32 max-w-7xl relative z-10 flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 space-y-6 sm:space-y-8">
          <div className="anim-reveal-up stagger-1 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-secondary/40 border border-border/30 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
            TikTok Intelligence
          </div>

          <div className="space-y-4 sm:space-y-5">
            <h1 className="anim-reveal-up stagger-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Analyze Any <br/>
              <span className="text-muted-foreground/60">TikTok Profile.</span>
            </h1>
            <p className="anim-reveal-up stagger-3 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed opacity-80">
              Clean, professional engagement metrics for creators and brands. Modern analytics, simplified.
            </p>
          </div>

          <div className="anim-float-in stagger-4 w-full max-w-3xl mx-auto pt-2 sm:pt-4">
            <SearchBar
              onSearch={handleSearch}
              isLoading={isLoading}
              placeholder="Search TikTok username..."
              platform="tiktok"
            />
          </div>
        </div>

        {error && !isLoading && (
          <div className="max-w-2xl mx-auto w-full mb-8 sm:mb-12 anim-reveal-scale">
            <ErrorMessage message={error} />
          </div>
        )}

        {searchFailed && !isLoading && (
          <div className="max-w-4xl mx-auto w-full mb-12 sm:mb-16 anim-reveal-scale">
            <ManualInputForm username={currentUsername} isTikTok={true} onCalculate={handleManualCalculate} />
          </div>
        )}

        {isLoading && (
          <div className="py-16 sm:py-24 anim-fade">
            <LoadingSpinner text="Harvesting TikTok data streams..." />
          </div>
        )}

        {/* Results Dashboard */}
        {data && !isLoading && (
          <div className="anim-float-in space-y-6 sm:space-y-8">
            <div ref={resultsRef} className="space-y-6 sm:space-y-8 p-1">
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-stretch">
                <div className="lg:col-span-4 h-full">
                  <CreatorProfileCard
                    username={data.profile.username}
                    followers={data.profile.followers}
                    profilePicture={data.profile.profilePicture}
                    postsAnalyzed={data.stats.postsAnalyzed}
                    estimatedPostValue={data.stats.estimatedPostValue}
                  />
                </div>
                <div className="lg:col-span-8 h-full">
                  <EngagementDisplay
                    engagementRate={data.stats.engagementRate}
                    quality={data.stats.quality}
                  />
                </div>
              </div>

              <div className="w-full pt-2 sm:pt-4">
                <MetricsWidgets
                  averageLikes={data.stats.averageLikes}
                  averageComments={data.stats.averageComments}
                  averageViews={data.stats.averageViews}
                  averageShares={data.stats.averageShares}
                  likeToViewRatio={data.stats.likeToViewRatio}
                  commentToLikeRatio={data.stats.commentToLikeRatio}
                  shareToViewRatio={data.stats.shareToViewRatio}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 sm:pt-16">
              <button
                onClick={handleExportPNG}
                disabled={exporting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300 active:scale-[0.97] disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {exporting ? "Exporting..." : "Export as PNG"}
              </button>
              <button
                onClick={handleCopyJSON}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300 active:scale-[0.97]"
              >
                <Copy className="w-3.5 h-3.5" />
                Export Analytics JSON
              </button>
            </div>
          </div>
        )}
      </div>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
