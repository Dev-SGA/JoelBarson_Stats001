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

export type MatchKind = "session" | "season";

export type MatchStats = {
  id: string;
  kind?: MatchKind;
  label: string;
  shortLabel: string;
  logo: string;
  progressivePasses: ProgressivePasses;
  breaklinePasses: BreaklinePasses;
  groundDuels: GroundDuels;
  aerialDuels?: AerialDuels | null;
  videos?: MatchVideo[];
  /** Set on season aggregate — number of matches rolled up. */
  games?: number;
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
  games?: number;
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

/** Average per recorded game, with one decimal when it is not a whole number. */
export function perGame(total: number, games: number): string {
  const value = games > 0 ? total / games : 0;
  const rounded = Math.round(value * 10) / 10;
  return rounded.toFixed(1).replace(/\.0$/, "");
}

export function seasonMatch(matches: MatchStats[]): MatchStats {
  const games = matches.length;
  const aerialWon = matches.reduce((sum, match) => sum + (match.aerialDuels?.won ?? 0), 0);
  const aerialLost = matches.reduce((sum, match) => sum + (match.aerialDuels?.lost ?? 0), 0);

  return {
    id: "season",
    kind: "season",
    label: "Season totals",
    shortLabel: "Season",
    logo: "",
    games,
    progressivePasses: {
      attempted: matches.reduce((sum, match) => sum + match.progressivePasses.attempted, 0),
      correct: matches.reduce((sum, match) => sum + match.progressivePasses.correct, 0),
    },
    breaklinePasses: {
      count: matches.reduce((sum, match) => sum + match.breaklinePasses.count, 0),
      videoLink: "",
    },
    groundDuels: {
      disputed: matches.reduce((sum, match) => sum + match.groundDuels.disputed, 0),
      lost: matches.reduce((sum, match) => sum + match.groundDuels.lost, 0),
      videoLink: "",
    },
    aerialDuels: aerialWon + aerialLost > 0 ? { won: aerialWon, lost: aerialLost } : null,
  };
}

export function toGameStats(report: StatsReport, match: MatchStats): GameStats {
  return {
    meta: {
      ...report.meta,
      subtitle: match.label,
      fileSlug: match.id === "season" ? `${report.meta.session}-season` : `${report.meta.session}-${match.id}`,
    },
    player: report.player,
    opponentLogo: match.logo,
    progressivePasses: match.progressivePasses,
    breaklinePasses: match.breaklinePasses,
    groundDuels: match.groundDuels,
    aerialDuels: match.aerialDuels ?? null,
    videos: match.videos,
    games: match.games,
  };
}

/** @deprecated Use getStatsReport — kept for type imports during transition */
export function getGameStats(): GameStats {
  const report = getStatsReport();
  const match = report.matches[0];
  return toGameStats(report, match);
}
