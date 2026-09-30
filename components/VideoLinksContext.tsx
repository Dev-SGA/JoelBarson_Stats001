"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GameStats } from "@/lib/stats";

type VideoLinksContextValue = {
  breaklineVideoLink: string;
  setBreaklineVideoLink: (value: string) => void;
  groundDuelsVideoLink: string;
  setGroundDuelsVideoLink: (value: string) => void;
  mergeIntoStats: (stats: GameStats) => GameStats;
};

const VideoLinksContext = createContext<VideoLinksContextValue | null>(null);

type VideoLinksProviderProps = {
  initialBreaklineVideoLink: string;
  initialGroundDuelsVideoLink: string;
  children: ReactNode;
};

export function VideoLinksProvider({
  initialBreaklineVideoLink,
  initialGroundDuelsVideoLink,
  children,
}: VideoLinksProviderProps) {
  const [breaklineVideoLink, setBreaklineVideoLink] = useState(initialBreaklineVideoLink);
  const [groundDuelsVideoLink, setGroundDuelsVideoLink] = useState(initialGroundDuelsVideoLink);

  const value = useMemo<VideoLinksContextValue>(
    () => ({
      breaklineVideoLink,
      setBreaklineVideoLink,
      groundDuelsVideoLink,
      setGroundDuelsVideoLink,
      mergeIntoStats(stats) {
        return {
          ...stats,
          breaklinePasses: { ...stats.breaklinePasses, videoLink: breaklineVideoLink },
          groundDuels: { ...stats.groundDuels, videoLink: groundDuelsVideoLink },
        };
      },
    }),
    [breaklineVideoLink, groundDuelsVideoLink],
  );

  return <VideoLinksContext.Provider value={value}>{children}</VideoLinksContext.Provider>;
}

export function useVideoLinks(): VideoLinksContextValue {
  const ctx = useContext(VideoLinksContext);
  if (!ctx) {
    throw new Error("useVideoLinks must be used within VideoLinksProvider");
  }
  return ctx;
}
