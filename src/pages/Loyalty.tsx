import { useState } from "react";
import { CheckCircle2, Gift, Star, Trophy } from "lucide-react";
import { Badge, Button, Progress } from "../components/ui";
import { useOperations } from "../context/OperationsContext";
import type { ProgramRules, VisitRecord } from "../lib/operations";

const tabs = [
  "Resumen",
  "Niveles",
  "Reglas",
  "Desafíos",
  "Recompensas",
] as const;
const tiers = [
  ["Explorador", 486, 0],
  ["Viajero", 342, 500],
  ["Frecuente", 281, 1500],
  ["Insider", 151, 3000],
  ["VIP", 24, 6000],
] as const;
export function Loyalty() {
  const { customers, settings, visits } = useOperations();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Resumen");
  const tierCounts = customers.reduce<Record<string, number>>((counts, customer) => {
    counts[customer.tier] = (counts[customer.tier] ?? 0) + 1;
    return counts;
  }, {});
  return (
    <div data-demo="loyalty-workspace" className="space-y-5">
      <header>
        <p className="eyebrow">Sistema de membresía</p>
        <h1 className="page-title mt-1">Fidelización</h1>
        <p className="mt-1.5 text-sm text-secondary">
          Diseña razones claras para progresar y volver.
        </p>
      </header>
      <div
        className="hide-scroll flex gap-1 overflow-x-auto border-b"
        role="tablist"
      >
        {tabs.map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-medium ${tab === item ? "border-brand text-primary" : "border-transparent text-secondary"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "Resumen" && <Overview customers={customers.length} issued={customers.reduce((sum, customer) => sum + customer.points, 0)} redeemed={visits.filter(visit => visit.points < 0).reduce((sum, visit) => sum + Math.abs(visit.points), 0)} counts={tierCounts} rules={settings.rules} />}
      {tab === "Niveles" && <TierLadder counts={tierCounts} />}
      {tab === "Reglas" && <Rules rules={settings.rules} friend={settings.referralFriendPoints} />}
      {tab === "Desafíos" && <Challenges visits={visits} />}
      {tab === "Recompensas" && <RewardsSummary />}
    </div>
  );
}
function Overview({ customers, issued, redeemed, counts }: { customers: number; issued: number; redeemed: number; counts: Record<string, number>; rules: ProgramRules }) {
  const usage = issued ? Math.round((redeemed / issued) * 1000) / 10 : 0;
  return (
    <>
      <section className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-4">
        {[
          ["Miembros", customers.toLocaleString("es-PE")],
          ["Puntos emitidos", issued.toLocaleString("es-PE")],
          ["Puntos canjeados", redeemed.toLocaleString("es-PE")],
          ["Uso de recompensas", `${usage}%`],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`p-5 ${index ? "border-t sm:border-l sm:border-t-0" : ""}`}
          >
            <p className="text-xs text-secondary">{label}</p>
            <p className="metric-number mt-2 text-2xl">{value}</p>
          </div>
        ))}
      </section>
      <TierLadder counts={counts} />
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-panel border bg-surface p-5">
          <h2 className="text-sm font-semibold">Desafío activo</h2>
          <p className="mt-4 text-lg font-medium">Visita 3 veces este mes</p>
          <p className="mt-1 text-sm text-secondary">
            250 puntos · 312 participantes
          </p>
          <div className="mt-5">
            <Progress value={67} label="Progreso promedio" />
          </div>
        </div>
        <div className="rounded-panel border bg-surface p-5">
          <h2 className="text-sm font-semibold">Recompensa con mejor uso</h2>
          <div className="mt-4 flex items-center gap-3">
            <Gift className="text-brand" />
            <div>
              <p className="font-medium">Café de la casa</p>
              <p className="text-sm text-secondary">86 canjes · 350 puntos</p>
            </div>
          </div>
          <button className="mt-5 text-sm font-semibold text-brand">
            Ver rendimiento →
          </button>
        </div>
      </section>
    </>
  );
}
function TierLadder({ counts }: { counts: Record<string, number> }) {
  return (
    <section className="rounded-panel border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Distribución de miembros</h2>
          <p className="mt-1 text-sm text-secondary">
            Progreso desde Explorador hasta VIP.
          </p>
        </div>
        <Button variant="secondary">Editar niveles</Button>
      </div>
      <div className="relative mt-8 grid gap-3 md:grid-cols-5">
        <div className="absolute left-[8%] right-[8%] top-5 hidden border-t md:block" />
        {tiers.map(([name, count, threshold], index) => (
          <div key={name} className="relative bg-surface text-center">
            <span
              className={`mx-auto grid size-10 place-items-center rounded-full border ${index === 4 ? "bg-brand text-white" : "bg-surface"}`}
            >
              {index === 4 ? <Trophy size={17} /> : <Star size={15} />}
            </span>
            <p className="mt-3 text-sm font-medium">{name}</p>
            <p className="metric-number mt-1 text-lg">{(counts[name] ?? count).toLocaleString("es-PE")}</p>
            <p className="text-xs text-secondary">
              {threshold.toLocaleString()}+ pts
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
function Rules({ rules, friend }: { rules: ProgramRules; friend: number }) {
  return (
    <section className="overflow-hidden rounded-panel border bg-surface">
      {[
        ["Compra", `S/ 1 = ${rules.pointsPerSol} punto${rules.pointsPerSol === 1 ? "" : "s"}`],
        ["Visita", `${rules.visitBonus} puntos`],
        ["5.ª visita", `${rules.milestoneBonus} puntos extra`],
        ["Referido convertido", `${friend} puntos para el amigo`],
        ["Cumpleaños", "200 puntos"],
        ["Tope diario", `${rules.dailyCap} puntos`],
        ["Vencimiento", rules.expirationDays ? `${rules.expirationDays} días sin visitar` : "Sin vencimiento"],
      ].map(([name, value]) => (
        <div
          key={name}
          className="flex items-center gap-3 border-b p-4 last:border-0"
        >
          <CheckCircle2 size={17} className="text-success" />
          <div className="flex-1">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-secondary">{value}</p>
          </div>
          <button
            role="switch"
            aria-checked="true"
            className="relative h-6 w-10 rounded-full bg-brand"
          >
            <span
              className="absolute left-5 top-1 size-4 rounded-full bg-white"
            />
          </button>
        </div>
      ))}
    </section>
  );
}
function Challenges({ visits }: { visits: VisitRecord[] }) {
  const month = new Date().getMonth();
  const counts = new Map<string, number>();
  visits.forEach(visit => {
    const date = new Date(visit.at);
    if (date.getMonth() !== month || visit.points < 0) return;
    counts.set(visit.customerId, (counts.get(visit.customerId) ?? 0) + 1);
  });
  const participants = counts.size;
  const completed = [...counts.values()].filter(count => count >= 3).length;
  return (
    <section className="rounded-panel border bg-surface p-5">
      <Badge tone="success">Activo</Badge>
      <h2 className="mt-4 text-xl font-medium">Visita 3 veces este mes</h2>
      <p className="mt-1 text-sm text-secondary">
        {participants} participantes · {completed} completaron · 250 puntos
      </p>
      <div className="mt-6 max-w-xl">
        <Progress value={41} label="Tasa de finalización" />
      </div>
      <Button variant="secondary" className="mt-5">
        Crear desafío
      </Button>
    </section>
  );
}
function RewardsSummary() {
  return (
    <section className="rounded-panel border bg-surface p-5">
      <h2 className="section-title">Rendimiento de recompensas</h2>
      <div className="mt-4 divide-y">
        {[
          ["Café de la casa", "86 canjes", "350 pts"],
          ["10% próxima visita", "48 canjes", "700 pts"],
          ["Postre para compartir", "31 canjes", "1,100 pts"],
        ].map((row) => (
          <div
            key={row[0]}
            className="grid grid-cols-[1fr_auto_auto] gap-5 py-3 text-sm"
          >
            <span className="font-medium">{row[0]}</span>
            <span className="text-secondary">{row[1]}</span>
            <span className="tabular-nums">{row[2]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
