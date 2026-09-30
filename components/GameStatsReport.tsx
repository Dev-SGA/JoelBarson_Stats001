"use client";

import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipLinks } from "@/components/ClipLinks";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type GameStatsReportProps = {
  stats: GameStats;
};

type BarTone = "accent" | "positive" | "negative" | "muted";

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function SplitMeter({
  title,
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
  primaryTone,
  secondaryTone,
  headline,
}: {
  title: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: BarTone;
  secondaryTone: BarTone;
  headline: string;
}) {
  const total = primary + secondary;
  const primaryPct = percent(primary, total);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      <p className="metric-card__headline">{headline}</p>
      <div className="meter" role="img" aria-label={`${primaryLabel}: ${primary}. ${secondaryLabel}: ${secondary}.`}>
        <span className={`meter__seg meter__seg--${primaryTone}`} style={{ width: `${primaryPct}%` }} />
        <span className={`meter__seg meter__seg--${secondaryTone}`} style={{ width: `${100 - primaryPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className={`legend__dot legend__dot--${primaryTone}`} />
          <span className="legend__label">{primaryLabel}</span>
          <strong>{primary}</strong>
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <span className="legend__label">{secondaryLabel}</span>
          <strong>{secondary}</strong>
        </li>
      </ul>
    </div>
  );
}

export function GameStatsReport({ stats }: GameStatsReportProps) {
  const { player, progressivePasses, breaklinePasses, groundDuels, meta } = stats;

  const incorrect = progressivePasses.attempted - progressivePasses.correct;
  const passAccuracy = percent(progressivePasses.correct, progressivePasses.attempted);
  const breaklineShare = percent(breaklinePasses.count, progressivePasses.attempted);

  const duelsWon = groundDuels.disputed - groundDuels.lost;
  const duelWinRate = percent(duelsWon, groundDuels.disputed);

  const topics: Topic[] = [
    {
      id: "progressive-passes",
      title: "Progressive Passes",
      phase: "build-up",
      content: (
        <MetricFlow
          items={[
            <div key="attempted" className="metric-card metric-card--hero">
              <h3 className="metric-card__title">Progressive passes</h3>
              <span className="metric-card__value">{progressivePasses.attempted}</span>
              <p className="metric-card__caption">Passes attempted that moved the ball significantly toward goal</p>
            </div>,
            <SplitMeter
              key="accuracy"
              title="Pass accuracy"
              headline={`${progressivePasses.correct} of ${progressivePasses.attempted} · ${passAccuracy}%`}
              primary={progressivePasses.correct}
              secondary={incorrect}
              primaryLabel="Correct"
              secondaryLabel="Incorrect"
              primaryTone="positive"
              secondaryTone="negative"
            />,
          ]}
        />
      ),
    },
    {
      id: "breakline-passes",
      title: "Breakline Passes",
      phase: "build-up",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="breakline" className="metric-card metric-card--hero">
                <h3 className="metric-card__title">Breakline passes</h3>
                <span className="metric-card__value">{breaklinePasses.count}</span>
                <p className="metric-card__caption">Passes that broke the defensive line</p>
              </div>,
              <div key="share" className="metric-card">
                <h3 className="metric-card__title">Share of progressive passes</h3>
                <span className="metric-card__value">{breaklineShare}%</span>
                <span className="metric-card__pct">
                  {breaklinePasses.count} of {progressivePasses.attempted} progressive passes
                </span>
              </div>,
            ]}
          />
          <ClipLinks scope="breakline" />
        </>
      ),
    },
    {
      id: "ground-duels",
      title: "Ground Duels",
      phase: "defensive",
      content: (
        <>
          <div className="metric-card metric-card--hero">
            <h3 className="metric-card__title">Ground duels</h3>
            <span className="metric-card__value">{groundDuels.disputed}</span>
            <p className="metric-card__caption">Total ground duels contested in the match</p>
          </div>
          <SplitMeter
            title="Duel outcome"
            headline={`${duelWinRate}% win rate`}
            primary={duelsWon}
            secondary={groundDuels.lost}
            primaryLabel="Won"
            secondaryLabel="Lost"
            primaryTone="positive"
            secondaryTone="negative"
          />
          <ClipLinks scope="groundDuels" />
        </>
      ),
    },
  ];

  return (
    <VideoLinksProvider
      initialBreaklineVideoLink={breaklinePasses.videoLink}
      initialGroundDuelsVideoLink={groundDuels.videoLink}
    >
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">{meta.subtitle}</p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard name={player.name} club={player.club} photoSrc={player.photo}>
            <ExportPdfButton stats={stats} />
          </AthleteProfileCard>

          <main className="report-main">
            <TopicsBoard topics={topics} />
          </main>
        </div>

        <footer className="footer">
          <p className="footer__slogan">{BRAND.slogan}</p>
          <p className="footer__rights">All rights reserved.</p>
        </footer>
      </div>
    </VideoLinksProvider>
  );
}
