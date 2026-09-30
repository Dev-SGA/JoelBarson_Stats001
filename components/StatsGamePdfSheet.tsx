import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
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

function linkHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.length > 48 ? `${url.slice(0, 45)}…` : url;
  }
}

function StatTiles({ items }: { items: { label: string; value: number; tone?: Tone }[] }) {
  return (
    <ul className="spdf-stats">
      {items.map((item) => (
        <li key={item.label} className="spdf-stat">
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>{item.value}</span>
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
}: {
  phase: Phase;
  title: string;
  value: number;
  unit: string;
  aside: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}`}>
      <p className="spdf-section__phase">{PHASE_LABEL[phase]}</p>
      <h3 className="spdf-section__title">{title}</h3>
      <div className="spdf-section__body">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">{value}</span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        <div className="spdf-section__aside">{aside}</div>
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
  );
}

function PdfVideoLinks({
  breaklineVideoLink,
  groundDuelsVideoLink,
}: {
  breaklineVideoLink: string;
  groundDuelsVideoLink: string;
}) {
  const rows = [
    { label: "Breakline passes", url: breaklineVideoLink.trim() },
    { label: "Ground duels", url: groundDuelsVideoLink.trim() },
  ];

  return (
    <section className="spdf-videos" aria-label="Video clips">
      <h4 className="spdf-videos__title">Video clips</h4>
      <ul className="spdf-videos__list">
        {rows.map((row) => (
          <li key={row.label}>
            {row.url ? (
              <a className="spdf-videos__link" href={row.url} data-pdf-link={row.url}>
                <span className="spdf-videos__play" aria-hidden="true">
                  ▶
                </span>
                <span className="spdf-videos__text">
                  <strong>{row.label}</strong>
                  <span>{linkHost(row.url)}</span>
                </span>
              </a>
            ) : (
              <span className="spdf-videos__empty">{row.label} — pending</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StatsGamePdfSheet({ stats, photoUrl, logoUrl }: StatsGamePdfSheetProps) {
  const { player, meta, progressivePasses, breaklinePasses, groundDuels } = stats;
  const incorrect = progressivePasses.attempted - progressivePasses.correct;
  const duelsWon = groundDuels.disputed - groundDuels.lost;

  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">{player.club}</p>
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
            <span>{meta.subtitle}</span>
          </div>
        </header>

        <div className="spdf-grid spdf-grid--three">
          <Section
            phase="build-up"
            title="Progressive Passes"
            value={progressivePasses.attempted}
            unit="Progressive passes"
            aside={
              <StatTiles
                items={[
                  { label: "Correct", value: progressivePasses.correct, tone: "green" },
                  { label: "Incorrect", value: incorrect, tone: "red" },
                ]}
              />
            }
            footer={
              <RateBar
                label="Pass accuracy"
                value={pct(progressivePasses.correct, progressivePasses.attempted)}
                note={`${progressivePasses.correct} of ${progressivePasses.attempted} progressive passes correct`}
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
            aside={
              <StatTiles items={[{ label: "Progressive passes", value: progressivePasses.attempted, tone: "blue" }]} />
            }
            footer={
              <RateBar
                label="Share of progressive passes"
                value={pct(breaklinePasses.count, progressivePasses.attempted)}
                note={`${breaklinePasses.count} of ${progressivePasses.attempted} progressive passes broke the line`}
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
                note={`${duelsWon} of ${groundDuels.disputed} ground duels won`}
                segments={[
                  { value: duelsWon, tone: "green" },
                  { value: groundDuels.lost, tone: "red" },
                ]}
              />
            }
          />
        </div>

        <PdfVideoLinks
          breaklineVideoLink={breaklinePasses.videoLink}
          groundDuelsVideoLink={groundDuels.videoLink}
        />

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
