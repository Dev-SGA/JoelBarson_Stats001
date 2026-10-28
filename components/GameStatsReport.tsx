"use client";

import { useMemo, useState } from "react";
import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipAnchor, ClipLegendLabel, ClipMetricTitle, PlayTip } from "@/components/ClipUi";
import { AvgPill, CountLine } from "@/components/CountLine";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND } from "@/lib/brand";
import { matchVideoClip, seasonMatch, toGameStats, type MatchStats, type StatsReport } from "@/lib/stats";

type GameStatsReportProps = {
  report: StatsReport;
};

type BarTone = "accent" | "positive" | "negative" | "muted";

const PASS_TIPS = {
  progressive:
    "Progressive Pass — A pass that moved the ball significantly toward goal or created a clear opportunity to advance the attack.",
  accurate: "Accurate Pass — A progressive pass that successfully reached a teammate.",
  inaccurate:
    "Inaccurate Pass — A progressive pass that failed to reach a teammate or immediately put the team under pressure.",
} as const;

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
  primaryHref,
  secondaryHref,
  usePlayTips,
  games,
  countUnit,
  seasonAvgLabels,
}: {
  title: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: BarTone;
  secondaryTone: BarTone;
  headline: string;
  primaryHref?: string;
  secondaryHref?: string;
  usePlayTips?: boolean;
  games?: number;
  countUnit?: string;
  seasonAvgLabels?: { primary: string; secondary: string };
}) {
  const total = primary + secondary;
  const primaryPct = percent(primary, total);
  const showAvg = Boolean(games && seasonAvgLabels);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      {games && countUnit ? <CountLine value={total} unit={countUnit} games={games} className="metric-card__count-line--meter" /> : null}
      <p className="metric-card__headline">{headline}</p>
      <div className="meter" role="img" aria-label={`${primaryLabel}: ${primary}. ${secondaryLabel}: ${secondary}.`}>
        <span className={`meter__seg meter__seg--${primaryTone}`} style={{ width: `${primaryPct}%` }} />
        <span className={`meter__seg meter__seg--${secondaryTone}`} style={{ width: `${100 - primaryPct}%` }} />
      </div>
      <ul className={`legend${showAvg ? " legend--season" : ""}`}>
        <li>
          <span className={`legend__dot legend__dot--${primaryTone}`} />
          {usePlayTips ? (
            <PlayTip label={primaryLabel} tip={PASS_TIPS.accurate} href={primaryHref} />
          ) : (
            <ClipLegendLabel label={primaryLabel} href={primaryHref} />
          )}
          {showAvg && games ? <AvgPill value={primary} games={games} className="avg-pill--legend" label="/ game" /> : null}
          {primaryHref ? (
            <ClipAnchor href={primaryHref} className="legend__clip-stat" ariaLabel={`Open video: ${primaryLabel}`}>
              {primary} · {primaryPct}%
            </ClipAnchor>
          ) : (
            <strong>
              {primary} · {primaryPct}%
            </strong>
          )}
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          {usePlayTips ? (
            <PlayTip label={secondaryLabel} tip={PASS_TIPS.inaccurate} href={secondaryHref} />
          ) : (
            <ClipLegendLabel label={secondaryLabel} href={secondaryHref} />
          )}
          {showAvg && games ? <AvgPill value={secondary} games={games} className="avg-pill--legend" label="/ game" /> : null}
          {secondaryHref ? (
            <ClipAnchor href={secondaryHref} className="legend__clip-stat" ariaLabel={`Open video: ${secondaryLabel}`}>
              {secondary} · {percent(secondary, total)}%
            </ClipAnchor>
          ) : (
            <strong>
              {secondary} · {percent(secondary, total)}%
            </strong>
          )}
        </li>
      </ul>
    </div>
  );
}

function MatchSwitcher({
  matches,
  activeId,
  onChange,
}: {
  matches: MatchStats[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  const index = matches.findIndex((match) => match.id === activeId);

  return (
    <div className="match-nav">
      <div className="match-nav__session" role="group" aria-label="Matches">
        <button
          type="button"
          className="match-nav__arrow"
          onClick={() => onChange(matches[index - 1].id)}
          disabled={index <= 0}
          aria-label="Previous match"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div className="match-nav__pills">
          {matches.map((match) => (
            <button
              key={match.id}
              type="button"
              className={`match-nav__pill${match.id === activeId ? " is-active" : ""}`}
              aria-pressed={match.id === activeId}
              onClick={() => onChange(match.id)}
            >
              {match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.logo} alt="" className="club-logo club-logo--pill" />
              ) : null}
              {match.shortLabel}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="match-nav__arrow"
          onClick={() => onChange(matches[index + 1].id)}
          disabled={index < 0 || index === matches.length - 1}
          aria-label="Next match"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}

function buildTopics(match: MatchStats): Topic[] {
  const { progressivePasses, breaklinePasses, groundDuels, aerialDuels } = match;
  const games = match.id === "season" ? match.games : undefined;
  const isSeason = Boolean(games && games > 0);
  const breaklineClip = isSeason
    ? undefined
    : matchVideoClip(match, "breakline", "Breakline passes", "Breakline Passes");
  const duelsClip = isSeason
    ? undefined
    : matchVideoClip(
    match,
    "groundDuels",
    "Ground duels",
    "Ground Duels",
    "Aerial duels",
    "Aerial Duels",
    "Duels",
    "All duels",
      );

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
              <h3 className="metric-card__title metric-card__title--tip">
                <PlayTip label="Progressive passes" tip={PASS_TIPS.progressive} />
              </h3>
              {games ? (
                <CountLine value={progressivePasses.attempted} unit="passes" games={games} size="hero" />
              ) : (
                <span className="metric-card__value">{progressivePasses.attempted}</span>
              )}
              <p className="metric-card__caption">
                {isSeason
                  ? "Total progressive passes across recorded matches"
                  : "Passes attempted that moved the ball significantly toward goal"}
              </p>
            </div>,
            <SplitMeter
              key="accuracy"
              title="Pass accuracy"
              headline={`${progressivePasses.correct} of ${progressivePasses.attempted} · ${passAccuracy}%`}
              primary={progressivePasses.correct}
              secondary={incorrect}
              primaryLabel="Accurate"
              secondaryLabel="Inaccurate"
              primaryTone="positive"
              secondaryTone="negative"
              usePlayTips
              games={games}
              countUnit="progressive passes"
              seasonAvgLabels={games ? { primary: "Accurate", secondary: "Inaccurate" } : undefined}
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
        <MetricFlow
          items={[
            <div key="breakline" className="metric-card metric-card--hero">
              <ClipMetricTitle label="Breakline passes" href={breaklineClip} />
              {games ? (
                <CountLine value={breaklinePasses.count} unit="passes" games={games} size="hero" />
              ) : breaklineClip ? (
                <ClipAnchor href={breaklineClip} className="metric-card__value clip-link--value" ariaLabel="Open video: Breakline passes">
                  {breaklinePasses.count}
                </ClipAnchor>
              ) : (
                <span className="metric-card__value">{breaklinePasses.count}</span>
              )}
              <p className="metric-card__caption">
                {isSeason ? "Total breakline passes across recorded matches" : "Passes that broke the defensive line"}
              </p>
            </div>,
            <div key="share" className="metric-card">
              <h3 className="metric-card__title">Share of progressive passes</h3>
              <span className="metric-card__value">{breaklineShare}%</span>
              <span className="metric-card__pct">
                {breaklinePasses.count} of {progressivePasses.attempted} progressive passes
              </span>
              {games ? <AvgPill value={breaklinePasses.count} games={games} className="metric-card__avg-pill" /> : null}
            </div>,
          ]}
        />
      ),
    },
    {
      id: "ground-duels",
      title: "Ground Duels",
      phase: "defensive",
      content: (
        <>
          <div className="metric-card metric-card--hero">
            <ClipMetricTitle label="Ground duels" href={duelsClip} />
            {games ? (
              <CountLine value={groundDuels.disputed} unit="duels" games={games} size="hero" />
            ) : duelsClip ? (
              <ClipAnchor href={duelsClip} className="metric-card__value clip-link--value" ariaLabel="Open video: Ground duels">
                {groundDuels.disputed}
              </ClipAnchor>
            ) : (
              <span className="metric-card__value">{groundDuels.disputed}</span>
            )}
            <p className="metric-card__caption">
              {isSeason ? "Total ground duels across recorded matches" : "Total ground duels contested in the match"}
            </p>
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
            games={games}
            countUnit="ground duels"
            seasonAvgLabels={games ? { primary: "Won", secondary: "Lost" } : undefined}
          />
        </>
      ),
    },
  ];

  if (aerialDuels && aerialDuels.won + (aerialDuels.lost ?? 0) > 0) {
    const aerialLost = aerialDuels.lost ?? 0;
    const aerialTotal = aerialDuels.won + aerialLost;

    topics.push({
      id: "aerial-duels",
      title: "Aerial Duels",
      phase: "defensive",
      content:
        aerialLost > 0 ? (
          <>
            <div className="metric-card metric-card--hero">
              <ClipMetricTitle label="Aerial duels" href={duelsClip} />
              {games ? (
                <CountLine value={aerialTotal} unit="duels" games={games} size="hero" />
              ) : duelsClip ? (
                <ClipAnchor href={duelsClip} className="metric-card__value clip-link--value" ariaLabel="Open video: Aerial duels">
                  {aerialTotal}
                </ClipAnchor>
              ) : (
                <span className="metric-card__value">{aerialTotal}</span>
              )}
              <p className="metric-card__caption">
                {isSeason ? "Total aerial duels across recorded matches" : "Total aerial duels contested in the match"}
              </p>
            </div>
            <SplitMeter
              title="Duel outcome"
              headline={`${percent(aerialDuels.won, aerialTotal)}% win rate`}
              primary={aerialDuels.won}
              secondary={aerialLost}
              primaryLabel="Won"
              secondaryLabel="Lost"
              primaryTone="positive"
              secondaryTone="negative"
              games={games}
              countUnit="aerial duels"
              seasonAvgLabels={games ? { primary: "Won", secondary: "Lost" } : undefined}
            />
          </>
        ) : (
          <div className="metric-card metric-card--hero">
            <ClipMetricTitle label="Aerial duels won" href={duelsClip} />
            {games ? (
              <CountLine value={aerialDuels.won} unit="won" games={games} size="hero" />
            ) : duelsClip ? (
              <ClipAnchor href={duelsClip} className="metric-card__value clip-link--value" ariaLabel="Open video: Aerial duels">
                {aerialDuels.won}
              </ClipAnchor>
            ) : (
              <span className="metric-card__value">{aerialDuels.won}</span>
            )}
            <p className="metric-card__caption">
              {isSeason ? "Total aerial duels won across recorded matches" : "Aerial duels won in the match"}
            </p>
          </div>
        ),
    });
  }

  return topics;
}

export function GameStatsReport({ report }: GameStatsReportProps) {
  const { player, meta, matches } = report;
  const options = useMemo(() => [...matches, seasonMatch(matches)], [matches]);
  const initialMatchId = matches[0]?.id ?? "";
  const [matchId, setMatchId] = useState(initialMatchId);
  const match = options.find((item) => item.id === matchId) ?? options[0];
  const exportStats = useMemo(() => toGameStats(report, match), [report, match]);
  const topics = useMemo(() => buildTopics(match), [match]);

  return (
    <VideoLinksProvider
      key={match.id}
      initialBreaklineVideoLink={match.breaklinePasses.videoLink}
      initialGroundDuelsVideoLink={match.groundDuels.videoLink}
    >
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">
              {match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.logo} alt="" className="club-logo club-logo--meta" />
              ) : null}
              {match.label}
            </p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard
            name={player.name}
            club={player.club}
            clubLogo={player.clubLogo}
            photoSrc={player.photo}
          >
            <ExportPdfButton stats={exportStats} />
          </AthleteProfileCard>

          <main className="report-main">
            <div className="view-panel">
              <MatchSwitcher matches={options} activeId={match.id} onChange={setMatchId} />
              <TopicsBoard topics={topics} />
            </div>
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
