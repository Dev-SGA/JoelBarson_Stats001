import { BRAND } from "@/lib/brand";
import { clipUrl, formatCount, type GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
  playIconUrl: string;
  clubLogoUrl?: string;
  opponentLogoUrl?: string;
};

type Phase = "build-up" | "defensive";

type Tone = "blue" | "green" | "red" | "grey";

const PHASE_LABEL: Record<Phase, string> = {
  "build-up": "Build-Up",
  defensive: "Defensive Phase",
};

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function PdfPlay({ href, playIconUrl }: { href?: string; playIconUrl: string }) {
  if (!href) return null;
  return (
    <a className="spdf-play" href={href} data-pdf-link={href} target="_blank" rel="noreferrer" aria-label="Open video">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={playIconUrl} alt="" className="spdf-play__icon" width={14} height={14} />
    </a>
  );
}

function PdfPlayTarget({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a className="spdf-play-target" href={href} data-pdf-link={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function resolveBreaklineClip(stats: GameStats): string | undefined {
  const fromList = clipUrl(stats.videos, "Breakline passes", "Breakline Passes")?.trim();
  const fallback = stats.breaklinePasses.videoLink.trim();
  return fromList || fallback || undefined;
}

function resolveDuelsClip(stats: GameStats): string | undefined {
  const fromList = clipUrl(
    stats.videos,
    "Ground duels",
    "Ground Duels",
    "Aerial duels",
    "Aerial Duels",
    "Duels",
    "All duels",
  )?.trim();
  const fallback = stats.groundDuels.videoLink.trim();
  return fromList || fallback || undefined;
}

function StatTiles({ items }: { items: { label: string; value: number; tone?: Tone }[] }) {
  return (
    <ul className="spdf-stats">
      {items.map((item) => (
        <li key={item.label} className="spdf-stat">
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>{formatCount(item.value)}</span>
          <span className="spdf-stat__label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

function RateBar({
  label,
  value,
  note,
  segments,
}: {
  label: string;
  value: number;
  note: string;
  segments: { value: number; tone: Tone }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className="spdf-rate">
      <div className="spdf-rate__head">
        <span className="spdf-rate__label">{label}</span>
        <span className="spdf-rate__value">{value}%</span>
      </div>
      <div className="spdf-rate__track">
        {segments.map((segment, index) =>
          segment.value > 0 ? (
            <span
              key={index}
              className={`spdf-rate__seg spdf-rate__seg--${segment.tone}`}
              style={{ width: `${pct(segment.value, total)}%` }}
            />
          ) : null,
        )}
      </div>
      <p className="spdf-rate__note">{note}</p>
    </div>
  );
}

function Section({
  phase,
  title,
  value,
  unit,
  aside,
  footer,
  playHref,
  playIconUrl,
}: {
  phase: Phase;
  title: string;
  value: number;
  unit: string;
  aside: React.ReactNode;
  footer?: React.ReactNode;
  playHref?: string;
  playIconUrl: string;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}`}>
      <p className="spdf-section__phase">{PHASE_LABEL[phase]}</p>
      <h3 className="spdf-section__title">
        {title}
        <PdfPlay href={playHref} playIconUrl={playIconUrl} />
      </h3>
      <div className="spdf-section__body">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">
            <PdfPlayTarget href={playHref}>{formatCount(value)}</PdfPlayTarget>
            <PdfPlay href={playHref} playIconUrl={playIconUrl} />
          </span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        <div className="spdf-section__aside">{aside}</div>
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
  );
}

export function StatsGamePdfSheet({
  stats,
  photoUrl,
  logoUrl,
  playIconUrl,
  clubLogoUrl,
  opponentLogoUrl,
}: StatsGamePdfSheetProps) {
  const { player, meta, progressivePasses, breaklinePasses, groundDuels, aerialDuels } = stats;
  const incorrect = progressivePasses.attempted - progressivePasses.correct;
  const duelsWon = groundDuels.disputed - groundDuels.lost;
  const aerialLost = aerialDuels?.lost ?? 0;
  const aerialTotal = (aerialDuels?.won ?? 0) + aerialLost;
  const showAerial = aerialDuels && aerialTotal > 0;
  const breaklineClip = resolveBreaklineClip(stats);
  const duelsClip = resolveDuelsClip(stats);

  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">
            {clubLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clubLogoUrl} alt="" className="spdf-side__club-logo" />
            ) : null}
            {player.club}
          </p>
        </div>
        <p className="spdf-side__slogan">{BRAND.slogan}</p>
      </aside>

      <div className="spdf-main">
        <header className="spdf-head">
          <div>
            <p className="spdf-head__eyebrow">{BRAND.legal}</p>
            <h1 className="spdf-head__title">{meta.title}</h1>
          </div>
          <div className="spdf-head__meta">
            <span className="spdf-head__match">
              {opponentLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opponentLogoUrl} alt="" className="spdf-head__logo" />
              ) : null}
              {meta.subtitle}
            </span>
          </div>
        </header>

        <div className={`spdf-grid${showAerial ? " spdf-grid--four" : " spdf-grid--three"}`}>
          <Section
            phase="build-up"
            title="Progressive Passes"
            value={progressivePasses.attempted}
            unit="Progressive passes"
            playIconUrl={playIconUrl}
            aside={
              <StatTiles
                items={[
                  { label: "Accurate", value: progressivePasses.correct, tone: "green" },
                  { label: "Inaccurate", value: incorrect, tone: "red" },
                ]}
              />
            }
            footer={
              <RateBar
                label="Pass accuracy"
                value={pct(progressivePasses.correct, progressivePasses.attempted)}
                note={`${formatCount(progressivePasses.correct)} of ${formatCount(progressivePasses.attempted)} progressive passes correct`}
                segments={[
                  { value: progressivePasses.correct, tone: "green" },
                  { value: incorrect, tone: "red" },
                ]}
              />
            }
          />

          <Section
            phase="build-up"
            title="Breakline Passes"
            value={breaklinePasses.count}
            unit="Breakline passes"
            playHref={breaklineClip}
            playIconUrl={playIconUrl}
            aside={
              <StatTiles items={[{ label: "Progressive passes", value: progressivePasses.attempted, tone: "blue" }]} />
            }
            footer={
              <RateBar
                label="Share of progressive passes"
                value={pct(breaklinePasses.count, progressivePasses.attempted)}
                note={`${formatCount(breaklinePasses.count)} of ${formatCount(progressivePasses.attempted)} progressive passes broke the line`}
                segments={[
                  { value: breaklinePasses.count, tone: "blue" },
                  { value: progressivePasses.attempted - breaklinePasses.count, tone: "grey" },
                ]}
              />
            }
          />

          <Section
            phase="defensive"
            title="Ground Duels"
            value={groundDuels.disputed}
            unit="Ground duels"
            playHref={duelsClip}
            playIconUrl={playIconUrl}
            aside={
              <StatTiles
                items={[
                  { label: "Won", value: duelsWon, tone: "green" },
                  { label: "Lost", value: groundDuels.lost, tone: "red" },
                ]}
              />
            }
            footer={
              <RateBar
                label="Duel win rate"
                value={pct(duelsWon, groundDuels.disputed)}
                note={`${formatCount(duelsWon)} of ${formatCount(groundDuels.disputed)} ground duels won`}
                segments={[
                  { value: duelsWon, tone: "green" },
                  { value: groundDuels.lost, tone: "red" },
                ]}
              />
            }
          />

          {showAerial ? (
            <Section
              phase="defensive"
              title="Aerial Duels"
              value={aerialTotal}
              unit="Aerial duels"
              playHref={duelsClip}
              playIconUrl={playIconUrl}
              aside={
                <StatTiles
                  items={[
                    { label: "Won", value: aerialDuels!.won, tone: "green" },
                    { label: "Lost", value: aerialLost, tone: "red" },
                  ]}
                />
              }
              footer={
                <RateBar
                  label="Duel win rate"
                  value={pct(aerialDuels!.won, aerialTotal)}
                  note={`${formatCount(aerialDuels!.won)} of ${formatCount(aerialTotal)} aerial duels won`}
                  segments={[
                    { value: aerialDuels!.won, tone: "green" },
                    { value: aerialLost, tone: "red" },
                  ]}
                />
              }
            />
          ) : null}
        </div>

        <footer className="spdf-foot">
          <span>{BRAND.name}</span>
          <span>
            {player.name} · {meta.title}
          </span>
        </footer>
      </div>
    </article>
  );
}
