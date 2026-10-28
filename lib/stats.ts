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
  /** Season numbers divided by the games played. */
  perGame?: boolean;
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

/** Whole numbers stay as they are; averages show one decimal. */
export function formatCount(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, "");
}

function scaleNumbers<T>(value: T, factor: number): T {
  if (typeof value === "number") return (value * factor) as T;
  if (Array.isArray(value) || value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, scaleNumbers(item, factor)]),
  ) as T;
}

/** Season match with every absolute number divided by the games played. Shares stay the same. */
export function perGameMatch(season: MatchStats): MatchStats {
  const games = season.games ?? 0;
  const factor = games > 0 ? 1 / games : 0;

  return {
    ...season,
    label: "Season · Per game",
    progressivePasses: scaleNumbers(season.progressivePasses, factor),
    breaklinePasses: scaleNumbers(season.breaklinePasses, factor),
    groundDuels: scaleNumbers(season.groundDuels, factor),
    aerialDuels: scaleNumbers(season.aerialDuels ?? null, factor),
    perGame: true,
  };
}

export function toGameStats(report: StatsReport, match: MatchStats): GameStats {
  return {
    meta: {
      ...report.meta,
      subtitle: match.label,
      fileSlug: `${report.meta.session}-${match.id}${match.perGame ? "-per-game" : ""}`,
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
