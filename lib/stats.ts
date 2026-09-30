import gameStats from "@/data/gameStats.json";

export type GameStats = {
  meta: {
    title: string;
    subtitle: string;
  };
  player: {
    name: string;
    club: string;
    photo: string;
  };
  progressivePasses: {
    attempted: number;
    correct: number;
  };
  breaklinePasses: {
    count: number;
    videoLink: string;
  };
  groundDuels: {
    disputed: number;
    lost: number;
    videoLink: string;
  };
};

export function getGameStats(): GameStats {
  return gameStats as GameStats;
}
