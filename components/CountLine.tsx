import { perGame } from "@/lib/stats";

type CountLineProps = {
  value: number;
  unit: string;
  games?: number;
  className?: string;
  /** hero = large figure for lead cards, compact = secondary cards. */
  size?: "hero" | "compact";
};

/** Season readout: big total figure, unit label and a per-game average pill. */
export function CountLine({ value, unit, games, className, size = "compact" }: CountLineProps) {
  const showAvg = Boolean(games && games > 0);
  const classes = ["count-line", `count-line--${size}`, showAvg ? "" : "count-line--single", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="count-line__total">
        <span className="count-line__value">{value}</span>
        <span className="count-line__unit">{unit}</span>
      </div>
      {showAvg && games ? <AvgPill value={value} games={games} /> : null}
    </div>
  );
}

type AvgPillProps = {
  value: number;
  games: number;
  className?: string;
  label?: string;
};

/** "8 AVG / GAME" pill used next to season totals. */
export function AvgPill({ value, games, className, label = "avg / game" }: AvgPillProps) {
  if (games <= 0) return null;
  return (
    <span className={`avg-pill${className ? ` ${className}` : ""}`} title={`${perGame(value, games)} average per game across ${games} matches`}>
      <span className="avg-pill__value">{perGame(value, games)}</span>
      <span className="avg-pill__label">{label}</span>
    </span>
  );
}
