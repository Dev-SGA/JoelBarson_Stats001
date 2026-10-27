import gameStats from "@/data/gameStats.json";

export type ProgressivePasses = {
  attempted: number;
  correct: number;
};

export type BreaklinePasses = {
  count: number;
  videoLink: string;
};

export type GroundDuels = {
  disputed: number;
  lost: number;
  videoLink: string;
};

export type AerialDuels = {
  won: number;
  lost?: number;
};

export type MatchVideo = {
  label: string;
  url: string;
};

export type MatchStats = {
  id: string;
  label: string;
  shortLabel: string;
  logo: string;
  progressivePasses: ProgressivePasses;
  breaklinePasses: BreaklinePasses;
  groundDuels: GroundDuels;
  aerialDuels?: AerialDuels | null;
  videos?: MatchVideo[];
};

export type StatsReport = {
  meta: {
    title: string;
    subtitle: string;
    session: string;
  };
  player: {
    name: string;
    club: string;
    clubLogo: string;
    photo: string;
  };
  matches: MatchStats[];
};

export type GameStats = {
  meta: StatsReport["meta"] & { fileSlug: string };
  player: StatsReport["player"];
  opponentLogo: string;
  progressivePasses: ProgressivePasses;
  breaklinePasses: BreaklinePasses;
  groundDuels: GroundDuels;
  aerialDuels?: AerialDuels | null;
  videos?: MatchVideo[];
};

export function clipUrl(videos: MatchVideo[] | undefined, ...aliases: string[]): string | undefined {
  if (!videos?.length) return undefined;
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const keys = new Set(aliases.map(normalize));
  return videos.find((video) => keys.has(normalize(video.label)))?.url;
}

export function matchVideoClip(match: MatchStats, scope: "breakline" | "groundDuels", ...aliases: string[]): string | undefined {
  const fromList = clipUrl(match.videos, ...aliases)?.trim();
  if (fromList) return fromList;
  const fallback = scope === "breakline" ? match.breaklinePasses.videoLink : match.groundDuels.videoLink;
  const trimmed = fallback.trim();
  return trimmed || undefined;
}

export function getStatsReport(): StatsReport {
  return gameStats as StatsReport;
}

export function toGameStats(report: StatsReport, match: MatchStats): GameStats {
  return {
    meta: {
      ...report.meta,
      subtitle: match.label,
      fileSlug: `${report.meta.session}-${match.id}`,
    },
    player: report.player,
    opponentLogo: match.logo,
    progressivePasses: match.progressivePasses,
    breaklinePasses: match.breaklinePasses,
    groundDuels: match.groundDuels,
    aerialDuels: match.aerialDuels ?? null,
    videos: match.videos,
  };
}

/** @deprecated Use getStatsReport — kept for type imports during transition */
export function getGameStats(): GameStats {
  const report = getStatsReport();
  const match = report.matches[0];
  return toGameStats(report, match);
}
