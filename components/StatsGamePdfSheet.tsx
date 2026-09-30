import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
};

type Phase = "build-up" | "defensive";

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

function Bar({
  label,
  value,
  total,
  tone,
  detail,
}: {
  label: string;
  value: number;
  total: number;
  tone: "blue" | "green" | "red";
  detail?: string;
}) {
  const share = pct(value, total);
  return (
    <div className="spdf-bar">
      <div className="spdf-bar__head">
        <span className="spdf-bar__label">{label}</span>
        <span className="spdf-bar__figure">
          {detail ?? value}
          <span className="spdf-bar__pct">{share}%</span>
        </span>
      </div>
      <div className="spdf-bar__track">
        <div className={`spdf-bar__fill spdf-bar__fill--${tone}`} style={{ width: `${share}%` }} />
      </div>
    </div>
  );
}

function Section({
  phase,
  title,
  value,
  unit,
  children,
}: {
  phase: Phase;
  title: string;
  value: string;
  unit: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}`}>
      <p className="spdf-section__phase">{PHASE_LABEL[phase]}</p>
      <h3 className="spdf-section__title">{title}</h3>
      <div className="spdf-section__kpi">
        <span className="spdf-section__value">{value}</span>
        <span className="spdf-section__unit">{unit}</span>
      </div>
      {children ? <div className="spdf-section__detail">{children}</div> : null}
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
  const issued = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

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
            <span>{issued}</span>
          </div>
        </header>

        <div className="spdf-grid">
          <Section
            phase="build-up"
            title="Progressive Passes"
            value={String(progressivePasses.attempted)}
            unit="attempted"
          >
            <Bar
              label="Correct"
              value={progressivePasses.correct}
              total={progressivePasses.attempted}
              detail={`${progressivePasses.correct}/${progressivePasses.attempted}`}
              tone="green"
            />
            <Bar
              label="Incorrect"
              value={incorrect}
              total={progressivePasses.attempted}
              detail={`${incorrect}/${progressivePasses.attempted}`}
              tone="red"
            />
          </Section>

          <Section phase="build-up" title="Breakline Passes" value={String(breaklinePasses.count)} unit="breakline passes">
            <Bar
              label="Share of progressive passes"
              value={breaklinePasses.count}
              total={progressivePasses.attempted}
              detail={`${breaklinePasses.count}/${progressivePasses.attempted}`}
              tone="blue"
            />
          </Section>

          <Section phase="build-up" title="Ground Duels" value={String(groundDuels.disputed)} unit="disputed">
            <Bar
              label="Won"
              value={duelsWon}
              total={groundDuels.disputed}
              detail={`${duelsWon}/${groundDuels.disputed}`}
              tone="green"
            />
            <Bar
              label="Lost"
              value={groundDuels.lost}
              total={groundDuels.disputed}
              detail={`${groundDuels.lost}/${groundDuels.disputed}`}
              tone="red"
            />
          </Section>
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
