// --- Engagement Grade & Quality ---

export type EngagementGrade = "A+" | "A" | "B" | "C" | "D";

export interface EngagementQuality {
  grade: EngagementGrade;
  label: string;
  description: string;
}

function getInstagramEngagementQuality(rate: number): EngagementQuality {
  if (rate >= 6)
    return { grade: "A+", label: "Exceptional", description: "Top-tier audience loyalty. This account significantly outperforms industry benchmarks." };
  if (rate >= 3.5)
    return { grade: "A", label: "Excellent", description: "Strong community engagement well above the industry average of 1-3%." };
  if (rate >= 1.5)
    return { grade: "B", label: "Good", description: "Healthy engagement within the typical Instagram benchmark range." };
  if (rate >= 0.5)
    return { grade: "C", label: "Average", description: "Moderate interaction. Content may benefit from optimization." };
  return { grade: "D", label: "Low", description: "Below average engagement. Consider reviewing content strategy." };
}

function getTikTokEngagementQuality(rate: number): EngagementQuality {
  if (rate >= 12)
    return { grade: "A+", label: "Viral", description: "Exceptional virality. This creator consistently drives massive audience interaction." };
  if (rate >= 7)
    return { grade: "A", label: "Excellent", description: "Outstanding engagement well above the TikTok average of 4-6%." };
  if (rate >= 4)
    return { grade: "B", label: "Good", description: "Solid performance within the typical TikTok engagement range." };
  if (rate >= 2)
    return { grade: "C", label: "Average", description: "Moderate interaction rate. Audience resonance could be improved." };
  return { grade: "D", label: "Low", description: "Below average for TikTok. Content may need strategic adjustments." };
}

// --- Estimated Post Value ---

function estimatePostValue(followers: number, engagementRate: number): { min: number; max: number } {
  const erMultiplier = Math.max(0.5, Math.min(engagementRate / 3, 3));
  const baseCPM = 10;
  const value = (followers / 1000) * baseCPM * erMultiplier;

  const min = Math.max(10, Math.round(value * 0.7));
  const max = Math.max(20, Math.round(value * 1.3));

  return { min, max };
}

// --- Instagram Calculator ---

export interface InstagramEngagementResult {
  averageLikes: number;
  averageComments: number;
  engagementRate: string;
  postsAnalyzed: number;
  commentToLikeRatio: string;
  quality: EngagementQuality;
  estimatedPostValue: { min: number; max: number };
}

export function calculateInstagramEngagement({
  followers,
  likesArray,
  commentsArray,
}: {
  followers: number;
  likesArray: number[];
  commentsArray: number[];
}): InstagramEngagementResult {
  if (followers <= 0) {
    return {
      averageLikes: 0,
      averageComments: 0,
      engagementRate: "0.00",
      postsAnalyzed: 0,
      commentToLikeRatio: "0.00",
      quality: getInstagramEngagementQuality(0),
      estimatedPostValue: { min: 0, max: 0 },
    };
  }

  const totalLikes = likesArray.reduce((acc, curr) => acc + curr, 0);
  const totalComments = commentsArray.reduce((acc, curr) => acc + curr, 0);

  const postsCount = Math.max(likesArray.length, commentsArray.length, 1);

  const averageLikes = Math.round(totalLikes / postsCount);
  const averageComments = Math.round(totalComments / postsCount);

  let engagementRate = ((averageLikes + averageComments) / followers) * 100;

  if (isNaN(engagementRate) || !isFinite(engagementRate)) {
    engagementRate = 0;
  }

  const commentToLikeRatio = averageLikes > 0
    ? ((averageComments / averageLikes) * 100)
    : 0;

  return {
    averageLikes,
    averageComments,
    engagementRate: engagementRate.toFixed(2),
    postsAnalyzed: postsCount,
    commentToLikeRatio: commentToLikeRatio.toFixed(2),
    quality: getInstagramEngagementQuality(engagementRate),
    estimatedPostValue: estimatePostValue(followers, engagementRate),
  };
}

// --- TikTok Calculator ---

export interface TikTokEngagementResult {
  averageViews: number;
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  engagementRate: string;
  postsAnalyzed: number;
  likeToViewRatio: string;
  commentToLikeRatio: string;
  shareToViewRatio: string;
  quality: EngagementQuality;
  estimatedPostValue: { min: number; max: number };
}

export function calculateTikTokEngagement({
  viewsArray,
  likesArray,
  commentsArray,
  sharesArray,
  followers,
}: {
  viewsArray: number[];
  likesArray: number[];
  commentsArray: number[];
  sharesArray: number[];
  followers?: number;
}): TikTokEngagementResult {
  const totalViews = viewsArray.reduce((acc, curr) => acc + curr, 0);
  const totalLikes = likesArray.reduce((acc, curr) => acc + curr, 0);
  const totalComments = commentsArray.reduce((acc, curr) => acc + curr, 0);
  const totalShares = sharesArray.reduce((acc, curr) => acc + curr, 0);

  const postsCount = Math.max(viewsArray.length, 1);

  const averageViews = Math.round(totalViews / postsCount);
  const averageLikes = Math.round(totalLikes / postsCount);
  const averageComments = Math.round(totalComments / postsCount);
  const averageShares = Math.round(totalShares / postsCount);

  // HypeAuditor: ((Average Likes + Average Comments + Average Shares) / Average Views) * 100
  let engagementRate = averageViews > 0
    ? ((averageLikes + averageComments + averageShares) / averageViews) * 100
    : 0;

  if (isNaN(engagementRate) || !isFinite(engagementRate)) {
    engagementRate = 0;
  }

  const likeToViewRatio = averageViews > 0
    ? ((averageLikes / averageViews) * 100)
    : 0;

  const commentToLikeRatio = averageLikes > 0
    ? ((averageComments / averageLikes) * 100)
    : 0;

  const shareToViewRatio = averageViews > 0
    ? ((averageShares / averageViews) * 100)
    : 0;

  const followerCount = followers || averageViews;

  return {
    averageViews,
    averageLikes,
    averageComments,
    averageShares,
    engagementRate: engagementRate.toFixed(2),
    postsAnalyzed: postsCount,
    likeToViewRatio: likeToViewRatio.toFixed(2),
    commentToLikeRatio: commentToLikeRatio.toFixed(2),
    shareToViewRatio: shareToViewRatio.toFixed(2),
    quality: getTikTokEngagementQuality(engagementRate),
    estimatedPostValue: estimatePostValue(followerCount, engagementRate),
  };
}
