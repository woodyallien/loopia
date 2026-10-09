import { ArrowRight, Award } from "lucide-react";
import { Badge } from "../components/ui";
import { money } from "../lib/utils";

const stages = [
  ["Compartieron", 412],
  ["Se registraron", 158],
  ["Primera visita", 72],
  ["Convertidos", 47],
] as const;
const leaders = [
  ["Mateo Vargas", 8, 7, 1050],
  ["Lucía Flores", 7, 6, 900],
  ["James Smith", 6, 5, 750],
  ["Camila Rojas", 5, 4, 600],
];
export function Referrals() {
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Crecimiento orgánico</p>
        <h1 className="page-title mt-1">Referidos</h1>
        <p className="mt-1.5 text-sm text-secondary">
          Entiende cómo una recomendación se convierte en una nueva visita.
        </p>
      </header>
      <section data-demo="referral-funnel" className="overflow-hidden rounded-panel border bg-surface">
        <div className="grid sm:grid-cols-2 xl:grid-cols-5">
          {stages.map(([label, value], index) => (
            <div
              key={label}
              className="relative border-b p-5 sm:border-r xl:border-b-0"
            >
              <p className="text-xs font-medium text-secondary">{label}</p>
              <p className="metric-number mt-2 text-3xl">{value}</p>
              {index < stages.length - 1 && (
                <p className="mt-2 text-xs text-secondary">
                  {Math.round((stages[index + 1][1] / value) * 100)}% avanza{" "}
                  <ArrowRight size={12} className="inline" />
                </p>
              )}
            </div>
          ))}
          <div className="bg-brand-subtle p-5">
            <p className="text-xs font-medium text-secondary">
              Ventas generadas
            </p>
            <p className="metric-number mt-2 text-2xl">{money(6840)}</p>
            <p className="mt-2 text-xs text-secondary">atribución estimada</p>
          </div>
        </div>
        <div className="border-t p-4">
          <div
            className="flex h-2 overflow-hidden rounded-full bg-subtle"
            aria-label="Funnel: 412 compartieron, 158 se registraron, 72 visitaron, 47 convirtieron"
          >
            <span className="w-[55%] bg-brand" />
            <span className="w-[21%] bg-success" />
            <span className="w-[14%] bg-warning" />
            <span className="w-[10%] bg-info" />
          </div>
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-panel border bg-surface">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Embajadores destacados</h2>
          </div>
          {leaders.map(([name, invited, converted, points], index) => (
            <div
              key={name}
              className="grid grid-cols-[32px_1fr_auto] items-center gap-3 border-b px-4 py-3 last:border-0"
            >
              <span className="font-mono text-xs text-tertiary">
                0{index + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-secondary">
                  {invited} invitaciones · {converted} conversiones
                </p>
              </div>
              <strong className="text-xs font-semibold tabular-nums">
                +{points} pts
              </strong>
            </div>
          ))}
        </div>
        <div className="rounded-panel border bg-surface p-5">
          <Badge tone="gold">Incentivo activo</Badge>
          <Award className="mt-6 text-brand" />
          <h2 className="mt-3 font-semibold">Dos experiencias mejores</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            El amigo recibe 100 puntos. El embajador recibe 150 después de la
            primera visita.
          </p>
          <button className="mt-5 text-sm font-semibold text-brand">
            Editar incentivo →
          </button>
        </div>
      </section>
    </div>
  );
}
