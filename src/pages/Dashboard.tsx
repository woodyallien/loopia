import { useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Megaphone,
  UserRound,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { GrowthChart } from "../components/Charts";
import { Badge, Empty } from "../components/ui";
import { useApp } from "../context/AppContext";
import { useOperations } from "../context/OperationsContext";
import { demoScenarios } from "../data/scenarios";
import {
  ageInDays,
  buildChart,
  daysSince,
  homeLocation,
  locationShare,
  relativeTime,
  trendPercent,
  usablePoints,
  type ChartMetric,
  type PeriodDays,
} from "../lib/analytics";
import { greeting, translateActivity } from "../lib/i18n";
import type { StoredCustomer } from "../lib/operations";
import { useTr } from "../lib/useTr";
import { money } from "../lib/utils";

export function Dashboard() {
  const { scenario, user, language } = useApp();
  const tr = useTr();
  const { customers, visits, campaigns, activity, settings } = useOperations();
  const demo = demoScenarios[scenario];
  const [location, setLocation] = useState("all");
  const [period, setPeriod] = useState<PeriodDays>(30);
  const [metric, setMetric] = useState<ChartMetric>("clientes");
  useEffect(() => {
    if (location !== "all" && !demo.locations.includes(location)) setLocation("all");
  }, [demo.locations, location]);

  const current = customers.filter((customer, index) => matches(customer, index, period, location, demo.locations));
  const previous = customers.filter((customer, index) => matchesPrevious(customer, index, period, location, demo.locations));
  const live = visits.filter(visit => visit.origin === "live" && ageInDays(visit.at) <= period && (location === "all" || visit.location === location));
  const previousLive = visits.filter(visit => visit.origin === "live" && ageInDays(visit.at) > period && ageInDays(visit.at) <= period * 2 && (location === "all" || visit.location === location));
  const sales = Math.round(estimatedSales(current, period) + live.reduce((sum, visit) => sum + visit.amount, 0));
  const previousSales = Math.round(estimatedSales(previous, period) + previousLive.reduce((sum, visit) => sum + visit.amount, 0));
  const returning = current.filter(customer => customer.visits >= 2).length;
  const previousReturning = previous.filter(customer => customer.visits >= 2).length;
  const referralTotal = current.reduce((sum, customer) => sum + customer.referrals, 0);
  const previousReferrals = previous.reduce((sum, customer) => sum + customer.referrals, 0);
  const cards = [
    [tr("Clientes activos", "Active customers"), current.length.toLocaleString("es-PE"), trendPercent(current.length, previous.length)],
    [tr("Regresaron", "Came back"), returning.toLocaleString("es-PE"), trendPercent(returning, previousReturning)],
    [tr("Referidos", "Referrals"), referralTotal.toLocaleString("es-PE"), trendPercent(referralTotal, previousReferrals)],
    [tr("Ventas registradas", "Recorded sales"), money(sales), trendPercent(sales, previousSales)],
  ] as const;
  const inactive = customers.filter((customer, index) => (location === "all" || homeLocation(index, demo.locations) === location) && daysSince(customer.lastVisit) >= 30).length;
  const nearVip = customers.filter(customer => customer.tier !== "VIP" && usablePoints(customer, settings.rules.expirationDays) >= 5800).length;
  const atRisk = customers.filter(customer => customer.status === "En riesgo").length;
  const inactiveText = tr(`${inactive} clientes llevan más de 30 días sin regresar.`, `${inactive} customers have not returned in over 30 days.`);
  const attention = [
    [scenario === "restaurant" ? inactiveText : tr(demo.opportunity, demo.opportunityEn), "high", tr("Crear campaña", "Create campaign"), "/app/campaigns"],
    [nearVip ? tr(`${nearVip} clientes están a menos de 200 puntos de VIP.`, `${nearVip} customers are under 200 points from VIP.`) : tr(`${atRisk} clientes están en riesgo de no volver.`, `${atRisk} customers are at risk of not returning.`), "medium", tr("Ver clientes", "View customers"), "/app/customers"],
    [scenario === "restaurant" ? tr("Los martes tienen 27% menos recurrencia.", "Tuesdays have 27% fewer repeat visits.") : inactiveText, "medium", tr("Crear incentivo", "Create incentive"), "/app/campaigns"],
  ] as const;
  const extra = metric === "clientes" ? new Set(live.map(visit => visit.customerId)).size : metric === "visitas" ? live.length : live.reduce((sum, visit) => sum + visit.amount, 0);
  const points = buildChart(metric, period, locationShare(location, demo.locations), extra);
  const best = [...campaigns].sort((a, b) => b.returned - a.returned || b.revenue - a.revenue)[0];
  const ambassadors = [...customers].sort((a, b) => b.referrals - a.referrals).slice(0, 3).filter(customer => customer.referrals > 0);
  const bestRate = best && best.sent ? Math.min(100, Math.round((best.returned / best.sent) * 100)) : 0;
  const metricOptions: [ChartMetric, string][] = [
    ["clientes", tr("Clientes", "Customers")],
    ["visitas", tr("Visitas", "Visits")],
    ["ventas", tr("Ventas", "Sales")],
  ];
  const trendUp = cards[1][2] >= 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-secondary">{greeting(language)}, {user?.name.split(" ")[0]}</p>
          <h1 className="page-title mt-1">{tr("¿Qué está pasando con tus clientes?", "What is happening with your customers?")}</h1>
          <p className="mt-2 text-sm text-secondary">
            {tr(`Los clientes que regresaron ${trendUp ? "aumentaron" : "cambiaron"} `, `Returning customers ${trendUp ? "grew" : "changed"} `)}
            <strong className={`font-semibold ${trendUp ? "text-success" : "text-danger"}`}>{formatTrend(cards[1][2])}</strong>
            {tr(" frente al periodo anterior.", " versus the previous period.")}
          </p>
        </div>
        <div className="flex gap-2">
          <select className="input h-10 min-h-10 w-auto" aria-label={tr("Local", "Location")} value={location} onChange={event => setLocation(event.target.value)}>
            <option value="all">{tr("Todos los locales", "All locations")}</option>
            {demo.locations.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="input h-10 min-h-10 w-auto" aria-label={tr("Periodo", "Period")} value={period} onChange={event => setPeriod(Number(event.target.value) as PeriodDays)}>
            <option value={30}>{tr("Últimos 30 días", "Last 30 days")}</option>
            <option value={7}>{tr("7 días", "7 days")}</option>
            <option value={90}>{tr("90 días", "90 days")}</option>
          </select>
        </div>
      </header>
      <section aria-label={tr("Métricas principales", "Key metrics")} className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, trend], index) => (
          <div key={label} className={`p-4 lg:p-5 ${index ? "border-t sm:border-l sm:border-t-0" : ""}`}>
            <p className="text-xs font-medium text-secondary">{label}</p>
            <p className="metric-number mt-2 text-[30px]">{value}</p>
            <p className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-success" : "text-danger"}`}>
              {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {formatTrend(trend)}
              <span className="font-normal text-secondary">{tr("vs. anterior", "vs. previous")}</span>
            </p>
          </div>
        ))}
      </section>
      <section data-demo="dashboard-opportunity">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="section-title">{tr("Qué requiere tu atención", "What needs your attention")}</h2>
            <p className="mt-1 text-sm text-secondary">{tr("Priorizado por impacto estimado.", "Ranked by estimated impact.")}</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-panel border bg-surface">
          {attention.map(([title, impact, action, href], index) => (
            <div key={title} className="grid gap-3 border-b p-4 last:border-0 md:grid-cols-[40px_1fr_auto_auto] md:items-center">
              <span className="font-mono text-xs text-tertiary">0{index + 1}</span>
              <div>
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="mt-1 text-xs text-secondary">{tr("Sugerencia contextual basada en los últimos 30 días.", "Suggestion based on the last 30 days.")}</p>
              </div>
              <Badge tone={impact === "high" ? "warning" : "neutral"}>
                {impact === "high" ? tr("Impacto Alto", "High impact") : tr("Impacto Medio", "Medium impact")}
              </Badge>
              <Link to={href} className="btn min-h-9 justify-self-start bg-brand px-3 text-xs text-white dark:text-[#101513] md:justify-self-end">
                {action}
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="rounded-panel border bg-surface p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="section-title">{tr("Clientes nuevos vs. recurrentes", "New vs. returning customers")}</h2>
              <p className="mt-1 text-sm text-secondary">{tr("La recurrencia impulsa la mejora del periodo.", "Repeat visits drive this period's growth.")}</p>
            </div>
            <div className="flex rounded-control bg-subtle p-1">
              {metricOptions.map(([key, label]) => (
                <button key={key} type="button" aria-pressed={metric === key} onClick={() => setMetric(key)} className={`min-h-8 rounded-md px-3 text-xs font-medium ${metric === key ? "bg-surface shadow-sm" : "text-secondary"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <GrowthChart points={points} summary={`${metricOptions.find(([key]) => key === metric)?.[1]} · ${period} ${tr("días", "days")}: ${points.map(point => `${point.name} ${point.value}`).join(", ")}`} />
          </div>
          <p className="border-l-2 border-brand pl-3 text-sm text-secondary">
            <strong className="text-primary">{tr("Cambio relevante:", "What changed:")}</strong>{" "}
            {location === "all"
              ? tr(`${returning} clientes recurrentes entran en este periodo.`, `${returning} returning customers in this period.`)
              : tr(`${returning} clientes recurrentes entran en ${location}.`, `${returning} returning customers at ${location}.`)}
          </p>
        </div>
        <div className="space-y-5">
          <div className="rounded-panel border bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{tr("Mejor campaña", "Best campaign")}</h2>
              <Megaphone size={16} className="text-secondary" />
            </div>
            {best ? (
              <>
                <p className="mt-4 text-sm font-medium">{best.name}</p>
                <p className="mt-1 text-xs text-secondary">{tr(`${best.returned} clientes regresaron`, `${best.returned} customers came back`)} · {money(best.revenue)}</p>
                <div className="mt-3 h-1.5 rounded-full bg-subtle">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${bestRate}%` }} />
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-secondary">{tr("Envía una campaña para medir el retorno.", "Send a campaign to measure returns.")}</p>
            )}
          </div>
          <div className="rounded-panel border bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{tr("Top embajadores", "Top ambassadors")}</h2>
              <Users size={16} className="text-secondary" />
            </div>
            {ambassadors.length ? ambassadors.map(customer => (
              <div key={customer.id} className="flex items-center gap-2 border-b py-2.5 last:border-0">
                <span className="grid size-7 place-items-center rounded-full bg-brand-subtle text-[10px] font-semibold">{customer.initials}</span>
                <span className="flex-1 text-xs font-medium">{customer.name}</span>
                <span className="text-xs text-secondary">{customer.referrals} {tr("referidos", "referrals")}</span>
              </div>
            )) : <p className="mt-4 text-sm text-secondary">{tr("Aún no hay referidos.", "No referrals yet.")}</p>}
          </div>
        </div>
      </section>
      <section className="rounded-panel border bg-surface">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">{tr("Actividad reciente", "Recent activity")}</h2>
          <Link to="/app/customers" className="text-xs font-medium text-secondary hover:text-primary">{tr("Ver todo", "View all")}</Link>
        </div>
        {activity.length ? (
          <div className="grid md:grid-cols-2">
            {activity.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center gap-3 border-b px-4 py-3 md:odd:border-r">
                <UserRound size={16} className="text-tertiary" />
                <p className="min-w-0 flex-1 truncate text-xs"><strong>{item.name}</strong> {translateActivity(language, item.action)}</p>
                <span className="text-xs text-secondary">{relativeTime(item.at, language)}</span>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon={<Activity />} title={tr("Sin actividad todavía", "No activity yet")} text={tr("Las visitas, canjes y campañas aparecerán aquí.", "Visits, redemptions, and campaigns will show up here.")} />
        )}
      </section>
    </div>
  );
}

function matches(customer: StoredCustomer, index: number, period: PeriodDays, location: string, locations: string[]) {
  if (location !== "all" && homeLocation(index, locations) !== location) return false;
  return daysSince(customer.lastVisit) <= period;
}

function matchesPrevious(customer: StoredCustomer, index: number, period: PeriodDays, location: string, locations: string[]) {
  if (location !== "all" && homeLocation(index, locations) !== location) return false;
  const days = daysSince(customer.lastVisit);
  return days > period && days <= period * 2;
}

function estimatedSales(list: StoredCustomer[], period: number) {
  return list.reduce((sum, customer) => {
    if (!customer.baselineVisits) return sum;
    const ticket = customer.baselineSpend / customer.baselineVisits;
    return sum + ticket * customer.baselineVisits * Math.min(1, period / 90);
  }, 0);
}

function formatTrend(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}
