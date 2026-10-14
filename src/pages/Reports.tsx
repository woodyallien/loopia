import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { GrowthChart } from "../components/Charts";
import { Badge, Button } from "../components/ui";
import { useApp } from "../context/AppContext";
import { useOperations } from "../context/OperationsContext";
import { demoScenarios } from "../data/scenarios";
import { ageInDays, buildChart, daysSince, homeLocation, locationShare, trendPercent, type PeriodDays } from "../lib/analytics";
import type { StoredCustomer } from "../lib/operations";
import { downloadCsv } from "../lib/utils";

export function Reports() {
  const { scenario } = useApp();
  const { customers, visits } = useOperations();
  const locations = demoScenarios[scenario].locations;
  const [period, setPeriod] = useState<PeriodDays>(180);
  const [location, setLocation] = useState("all");
  const [segment, setSegment] = useState("all");
  const current = useMemo(() => customers.filter((customer, index) => inReport(customer, index, period, location, locations, segment, false)), [customers, period, location, locations, segment]);
  const previous = useMemo(() => customers.filter((customer, index) => inReport(customer, index, period, location, locations, segment, true)), [customers, period, location, locations, segment]);
  const returning = current.filter(customer => customer.visits >= 2).length;
  const previousReturning = previous.filter(customer => customer.visits >= 2).length;
  const rate = current.length ? (returning / current.length) * 100 : 0;
  const previousRate = previous.length ? (previousReturning / previous.length) * 100 : 0;
  const change = trendPercent(rate, previousRate);
  const live = visits.filter(visit => visit.origin === "live" && ageInDays(visit.at) <= period && (location === "all" || visit.location === location));
  const points = buildChart("clientes", period, locationShare(location, locations), new Set(live.map(visit => visit.customerId)).size);
  const rows = (location === "all" ? locations : [location]).map(name => {
    const here = customers.filter((customer, index) => homeLocation(index, locations) === name && matchesSegment(customer, segment) && daysSince(customer.lastVisit) <= period);
    const before = customers.filter((customer, index) => homeLocation(index, locations) === name && matchesSegment(customer, segment) && daysSince(customer.lastVisit) > period && daysSince(customer.lastVisit) <= period * 2);
    const hereRate = here.length ? (here.filter(customer => customer.visits >= 2).length / here.length) * 100 : 0;
    const beforeRate = before.length ? (before.filter(customer => customer.visits >= 2).length / before.length) * 100 : 0;
    const delta = trendPercent(hereRate, beforeRate);
    return [name, String(here.length), `${hereRate.toFixed(1)}%`, `${delta > 0 ? "+" : ""}${delta}%`] as const;
  });
  const exportRows = () => downloadCsv(`loopia-reportes-${period}-dias.csv`, [["Local", "Clientes", "Retorno", "Cambio"], ...rows.map(row => [...row])]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Análisis</p>
          <h1 className="page-title mt-1">¿Están regresando más clientes?</h1>
          <p className="mt-1.5 text-sm text-secondary">Compara recurrencia, segmentos y locales antes de tomar una decisión.</p>
        </div>
        <Button variant="secondary" onClick={exportRows}>
          <Download size={16} />
          Exportar CSV
        </Button>
      </header>
      <div className="sticky top-14 z-10 flex flex-wrap gap-2 rounded-panel border bg-background/95 p-2 backdrop-blur">
        <select className="input h-9 min-h-9 w-auto text-xs" aria-label="Periodo del reporte" value={period} onChange={event => setPeriod(Number(event.target.value) as PeriodDays)}>
          <option value={180}>Últimos 6 meses</option>
          <option value={90}>90 días</option>
          <option value={30}>30 días</option>
        </select>
        <select className="input h-9 min-h-9 w-auto text-xs" aria-label="Comparación" defaultValue="anterior">
          <option value="anterior">vs. periodo anterior</option>
        </select>
        <select className="input h-9 min-h-9 w-auto text-xs" aria-label="Local del reporte" value={location} onChange={event => setLocation(event.target.value)}>
          <option value="all">Todos los locales</option>
          {locations.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="input h-9 min-h-9 w-auto text-xs" aria-label="Segmento" value={segment} onChange={event => setSegment(event.target.value)}>
          <option value="all">Todos los segmentos</option>
          <option value="VIP">VIP</option>
          <option value="Frecuente">Frecuentes</option>
          <option value="En riesgo">En riesgo</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>
      <section data-demo="reports-result" className="rounded-panel border bg-surface p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-secondary">Tasa de retorno</p>
            <p className="metric-number mt-1 text-4xl">{rate.toFixed(1)}%</p>
            <p className={`mt-2 text-xs font-medium ${change >= 0 ? "text-success" : "text-danger"}`}>
              {change > 0 ? "+" : ""}{change}% frente al periodo anterior
            </p>
          </div>
          <Badge tone={change >= 0 ? "success" : "warning"}>{change >= 0 ? "Mejora" : "Baja"}</Badge>
        </div>
        <div className="mt-4">
          <GrowthChart points={points} summary={`Retorno de ${period} días: ${points.map(point => `${point.name} ${point.value}`).join(", ")}`} />
        </div>
        <div className="mt-3 border-l-2 border-brand pl-3">
          <p className="text-sm">
            <strong>Qué cambió:</strong> {returning} de {current.length} clientes del filtro volvieron
            {location === "all" ? " en todos los locales." : ` en ${location}.`}
          </p>
          <a href="#desglose-locales" className="mt-1 inline-block text-xs font-semibold text-brand">Ver desglose del segmento →</a>
        </div>
      </section>
      <section id="desglose-locales" className="overflow-hidden rounded-panel border bg-surface">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Desglose por local</h2>
        </div>
        <table className="hidden w-full text-left text-sm md:table">
          <thead className="bg-subtle/60 text-xs text-secondary">
            <tr>{["Local", "Clientes", "Retorno", "Cambio"].map(label => <th key={label} className="px-4 py-2 font-medium">{label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row[0]} className="border-t">
                {row.map((cell, index) => <td key={`${row[0]}-${cell}`} className={`px-4 py-3 ${index === 3 ? cell.startsWith("-") ? "font-medium text-danger" : "font-medium text-success" : ""}`}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="divide-y md:hidden">
          {rows.map(([name, clients, rate, change]) => (
            <li key={name} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="mt-0.5 text-xs text-secondary">{clients} clientes · {rate} retorno</p>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${change.startsWith("-") ? "text-danger" : "text-success"}`}>{change}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function matchesSegment(customer: StoredCustomer, segment: string) {
  if (segment === "all") return true;
  if (segment === "Frecuente") return customer.status === "Frecuente" || customer.tier === "Frecuente";
  return customer.status === segment || customer.tier === segment;
}

function inReport(customer: StoredCustomer, index: number, period: PeriodDays, location: string, locations: string[], segment: string, previous: boolean) {
  if (location !== "all" && homeLocation(index, locations) !== location) return false;
  if (!matchesSegment(customer, segment)) return false;
  const days = daysSince(customer.lastVisit);
  return previous ? days > period && days <= period * 2 : days <= period;
}
