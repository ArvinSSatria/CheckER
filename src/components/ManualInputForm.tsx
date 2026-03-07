import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ManualInputFormProps {
  username?: string;
  isTikTok?: boolean;
  onCalculate: (data: {
    username: string;
    followers: number;
    likesArray: number[];
    commentsArray: number[];
    viewsArray?: number[];
    sharesArray?: number[];
  }) => void;
}

export function ManualInputForm({ username = "", isTikTok = false, onCalculate }: ManualInputFormProps) {
  const [followers, setFollowers] = useState<string>("");
  const [postsCount, setPostsCount] = useState<string>(isTikTok ? "9" : "18");
  
  // Base metrics
  const [totalLikes, setTotalLikes] = useState<string>("");
  const [totalComments, setTotalComments] = useState<string>("");
  
  // TikTok specific metrics
  const [totalViews, setTotalViews] = useState<string>("");
  const [totalShares, setTotalShares] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fCount = parseInt(followers) || 0;
    const pCount = parseInt(postsCount) || 1;
    const lTotal = parseInt(totalLikes) || 0;
    const cTotal = parseInt(totalComments) || 0;
    
    const vTotal = parseInt(totalViews) || 0;
    const sTotal = parseInt(totalShares) || 0;

    // Simulate arrays to fit the existing calculator utility
    const avgLikes = Math.floor(lTotal / pCount);
    const avgComments = Math.floor(cTotal / pCount);
    const avgViews = Math.floor(vTotal / pCount);
    const avgShares = Math.floor(sTotal / pCount);

    const likesArray = Array(pCount).fill(avgLikes);
    const commentsArray = Array(pCount).fill(avgComments);
    const viewsArray = Array(pCount).fill(avgViews);
    const sharesArray = Array(pCount).fill(avgShares);

    // Deal with remainders
    if (likesArray.length > 0) likesArray[0] += lTotal % pCount;
    if (commentsArray.length > 0) commentsArray[0] += cTotal % pCount;
    if (viewsArray.length > 0) viewsArray[0] += vTotal % pCount;
    if (sharesArray.length > 0) sharesArray[0] += sTotal % pCount;

    onCalculate({
      username: username || "Manual Entry",
      followers: fCount,
      likesArray,
      commentsArray,
      ...(isTikTok && { viewsArray, sharesArray })
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto rounded-2xl border border-border bg-card soft-shadow animate-in zoom-in-95 duration-500">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight">Manual Entry</CardTitle>
        <CardDescription className="text-muted-foreground/70 text-xs">
          We couldn't scrape the public data automatically. Please enter the stats manually to calculate engagement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {!isTikTok && (
               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Followers Count</label>
                 <Input
                   type="number"
                   min="1"
                   required={!isTikTok}
                   value={followers}
                   onChange={(e) => setFollowers(e.target.value)}
                   placeholder="e.g. 15000"
                   className="bg-background/50 border-border focus-visible:ring-primary/20"
                 />
               </div>
            )}
            {isTikTok && (
                <div className="space-y-1.5">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Followers (Optional)</label>
                 <Input
                   type="number"
                   min="0"
                   value={followers}
                   onChange={(e) => setFollowers(e.target.value)}
                   placeholder="e.g. 15000"
                   className="bg-background/50 border-border focus-visible:ring-primary/20"
                 />
               </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Number of Posts</label>
              <Input
                type="number"
                min="1"
                required
                value={postsCount}
                onChange={(e) => setPostsCount(e.target.value)}
                placeholder="e.g. 9"
                className="bg-background/50 border-border focus-visible:ring-primary/20"
              />
            </div>

            {isTikTok && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Total Views (Recent)</label>
                  <Input
                    type="number"
                    min="1"
                    required={isTikTok}
                    value={totalViews}
                    onChange={(e) => setTotalViews(e.target.value)}
                    placeholder="e.g. 150000"
                    className="bg-background/50 border-border focus-visible:ring-primary/20"
                  />
                </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Likes</label>
              <Input
                type="number"
                min="0"
                required
                value={totalLikes}
                onChange={(e) => setTotalLikes(e.target.value)}
                placeholder="e.g. 5000"
                className="bg-background/50 border-border focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Comments</label>
              <Input
                type="number"
                min="0"
                required
                value={totalComments}
                onChange={(e) => setTotalComments(e.target.value)}
                placeholder="e.g. 200"
                className="bg-background/50 border-border focus-visible:ring-primary/20"
              />
            </div>

            {isTikTok && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Total Shares</label>
                  <Input
                    type="number"
                    min="0"
                    required={isTikTok}
                    value={totalShares}
                    onChange={(e) => setTotalShares(e.target.value)}
                    placeholder="e.g. 50"
                    className="bg-background/50 border-border focus-visible:ring-primary/20"
                  />
                </div>
            )}
          </div>
          <Button type="submit" className="w-full font-bold shadow-sm transition-all duration-250">
            Calculate Engagement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
