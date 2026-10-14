import { useState } from "react";
import { ArrowRight, Award } from "lucide-react";
import { Badge, Button } from "../components/ui";
import { useOperations } from "../context/OperationsContext";
import { money } from "../lib/utils";

export function Referrals() {
  const { customers, referrals, settings, saveSettings } = useOperations();
  const [editing, setEditing] = useState(false);
  const [friendPoints, setFriendPoints] = useState(settings.referralFriendPoints);
  const [referrerPoints, setReferrerPoints] = useState(settings.referralReferrerPoints);
  const converted = referrals.filter(item => item.status === "converted").length;
  const stages = [
    ["Compartieron", 412 + referrals.length],
    ["Se registraron", 158 + referrals.length],
    ["Primera visita", 72 + converted],
    ["Convertidos", 47 + converted],
  ] as const;
  const leaders = [...customers].sort((a, b) => b.referrals - a.referrals).slice(0, 4);
  const sales = 6840 + referrals.reduce((sum, item) => sum + item.sales, 0);
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
            <p className="metric-number mt-2 text-2xl">{money(sales)}</p>
            <p className="mt-2 text-xs text-secondary">atribución estimada</p>
          </div>
        </div>
        <div className="border-t p-4">
          <div
            className="flex h-2 overflow-hidden rounded-full bg-subtle"
            aria-label={`Funnel: ${stages.map(([label, value]) => `${value} ${label.toLowerCase()}`).join(", ")}`}
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
          {leaders.map((customer, index) => (
            <div
              key={customer.id}
              className="grid grid-cols-[32px_1fr_auto] items-center gap-3 border-b px-4 py-3 last:border-0"
            >
              <span className="font-mono text-xs text-tertiary">
                0{index + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{customer.name}</p>
                <p className="text-xs text-secondary">
                  {customer.referrals} conversiones
                </p>
              </div>
              <strong className="text-xs font-semibold tabular-nums">
                +{customer.referrals * settings.referralReferrerPoints} pts
              </strong>
            </div>
          ))}
        </div>
        <div className="rounded-panel border bg-surface p-5">
          <Badge tone="gold">Incentivo activo</Badge>
          <Award className="mt-6 text-brand" />
          <h2 className="mt-3 font-semibold">Dos experiencias mejores</h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            El amigo recibe {settings.referralFriendPoints} puntos. Quien recomienda recibe {settings.referralReferrerPoints} después de la primera visita.
          </p>
          <button className="mt-5 text-sm font-semibold text-brand" onClick={() => setEditing(value => !value)}>
            Editar incentivo →
          </button>
          {editing && (
            <form className="mt-4 space-y-3" onSubmit={event => { event.preventDefault(); saveSettings({ ...settings, referralFriendPoints: friendPoints, referralReferrerPoints: referrerPoints }); setEditing(false); }}>
              <label><span className="label">Puntos del amigo</span><input className="input" type="number" min={0} value={friendPoints} onChange={event => setFriendPoints(Number(event.target.value))} /></label>
              <label><span className="label">Puntos de quien recomienda</span><input className="input" type="number" min={0} value={referrerPoints} onChange={event => setReferrerPoints(Number(event.target.value))} /></label>
              <Button type="submit">Guardar incentivo</Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
