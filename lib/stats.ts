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

export type MatchStats = {
  id: string;
  label: string;
  shortLabel: string;
  logo: string;
  progressivePasses: ProgressivePasses;
  breaklinePasses: BreaklinePasses;
  groundDuels: GroundDuels;
  aerialDuels?: AerialDuels | null;
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
};

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
  };
}

/** @deprecated Use getStatsReport — kept for type imports during transition */
export function getGameStats(): GameStats {
  const report = getStatsReport();
  const match = report.matches[0];
  return toGameStats(report, match);
}
