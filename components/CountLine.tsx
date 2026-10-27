import { perGame } from "@/lib/stats";

type CountLineProps = {
  value: number;
  unit: string;
  games?: number;
  className?: string;
};

/** Season readout: "58 progressive passes | 29 avg per game". */
export function CountLine({ value, unit, games, className }: CountLineProps) {
  if (!games || games <= 0) return null;

  return (
    <p className={`count-line${className ? ` ${className}` : ""}`}>
      <span className="count-line__main">
        {value} {unit}
      </span>
      <span className="count-line__sep" aria-hidden="true">
        |
      </span>
      <span className="count-line__avg">{perGame(value, games)} avg per game</span>
    </p>
  );
}
