import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden relative min-h-[calc(100vh-80px)]">

      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8B735508_1px,transparent_1px),linear-gradient(to_bottom,#8B735508_1px,transparent_1px)] bg-[size:32px_32px] bg-grid-pulse" />
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(139,115,85,0.05)_0,transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(212,197,173,0.03)_0,transparent_70%)]" />

      <div className="max-w-4xl text-center space-y-10 z-10 pt-10">
        <div className="space-y-6 flex flex-col items-center">
          {/* Badge */}
          <div className="anim-reveal-up stagger-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/50 border border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
            Social Intelligence Platform
          </div>

          {/* Heading */}
          <h1 className="anim-reveal-up stagger-2 text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.1] sm:leading-[1.1]">
            Engagement <br/>
            <span className="text-muted-foreground/60">Calculator</span>
          </h1>

          {/* Subtitle */}
          <p className="anim-reveal-up stagger-3 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Analyze influencers with professional-grade precision. Check Instagram and TikTok engagement instantly with our minimalist platform.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="anim-float-in stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 w-full sm:w-auto px-4">
          <Link href="/instagram-engagement-calculator" className="w-full sm:w-auto group">
            <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full bg-foreground text-background font-semibold hover:bg-foreground/90 transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]">
              Instagram Check
            </Button>
          </Link>
          <Link href="/tiktok-engagement-calculator" className="w-full sm:w-auto group">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-8 rounded-full border border-border bg-card/50 text-foreground font-medium hover:bg-accent transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98] backdrop-blur-sm">
              TikTok Check
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
