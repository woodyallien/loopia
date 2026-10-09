import {
  ArrowRight,
  ArrowUpRight,
  Megaphone,
  UserRound,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { GrowthChart } from "../components/Charts";
import { Badge } from "../components/ui";
import { activity } from "../data/mock";
import { money } from "../lib/utils";
import { useApp } from "../context/AppContext";
import { demoScenarios } from "../data/scenarios";

export function Dashboard() {
  const { scenario, user } = useApp();
  const demo = demoScenarios[scenario];
  const metrics = [
    ["Clientes activos", demo.metrics.customers, "+12.4%"],
    ["Regresaron", demo.metrics.returning, "+18.2%"],
    ["Referidos", demo.metrics.referrals, "+23.1%"],
    ["Ventas registradas", money(demo.metrics.sales), "+14.7%"],
  ];
  const attention = [
    [demo.opportunity, "Alto", "Crear campaña", "/app/campaigns"],
    [
      "14 clientes están a menos de 200 puntos de VIP.",
      "Medio",
      "Ver clientes",
      "/app/customers",
    ],
    [
      "Los martes tienen 27% menos recurrencia.",
      "Medio",
      "Crear incentivo",
      "/app/campaigns",
    ],
  ];
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-secondary">
            Buenos días, {user?.name.split(" ")[0]}
          </p>
          <h1 className="page-title mt-1">
            ¿Qué está pasando con tus clientes?
          </h1>
          <p className="mt-2 text-sm text-secondary">
            Los clientes recurrentes aumentaron{" "}
            <strong className="font-semibold text-success">18%</strong> durante
            los últimos 30 días.
          </p>
        </div>
        <div className="flex gap-2">
          <select className="input h-10 min-h-10 w-auto" aria-label="Local">
            <option>Todos los locales</option>
            {demo.locations.map((location) => (
              <option key={location}>{location}</option>
            ))}
          </select>
          <select className="input h-10 min-h-10 w-auto" aria-label="Periodo">
            <option>Últimos 30 días</option>
            <option>7 días</option>
            <option>90 días</option>
          </select>
        </div>
      </header>
      <section
        aria-label="Métricas principales"
        className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map(([label, value, trend], index) => (
          <div
            key={label}
            className={`p-4 lg:p-5 ${index ? "border-t sm:border-l sm:border-t-0" : ""}`}
          >
            <p className="text-xs font-medium text-secondary">{label}</p>
            <p className="metric-number mt-2 text-[30px]">{value}</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-success">
              <ArrowUpRight size={13} />
              {trend}
              <span className="font-normal text-secondary">vs. anterior</span>
            </p>
          </div>
        ))}
      </section>
      <section data-demo="dashboard-opportunity">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="section-title">Qué requiere tu atención</h2>
            <p className="mt-1 text-sm text-secondary">
              Priorizado por impacto estimado.
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-panel border bg-surface">
          {attention.map(([title, impact, action, href], index) => (
            <div
              key={title}
              className="grid gap-3 border-b p-4 last:border-0 md:grid-cols-[40px_1fr_auto_auto] md:items-center"
            >
              <span className="font-mono text-xs text-tertiary">
                0{index + 1}
              </span>
              <div>
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="mt-1 text-xs text-secondary">
                  Sugerencia contextual basada en los últimos 30 días.
                </p>
              </div>
              <Badge tone={impact === "Alto" ? "warning" : "neutral"}>
                Impacto {impact}
              </Badge>
              <Link
                to={href}
                className="btn min-h-9 justify-self-start bg-brand px-3 text-xs text-white dark:text-[#101513] md:justify-self-end"
              >
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
              <h2 className="section-title">Clientes nuevos vs. recurrentes</h2>
              <p className="mt-1 text-sm text-secondary">
                La recurrencia impulsa la mejora del periodo.
              </p>
            </div>
            <div className="flex rounded-control bg-subtle p-1">
              {["Clientes", "Visitas", "Ventas"].map((item, index) => (
                <button
                  key={item}
                  className={`min-h-8 rounded-md px-3 text-xs font-medium ${index === 0 ? "bg-surface shadow-sm" : "text-secondary"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <GrowthChart />
          </div>
          <p className="border-l-2 border-brand pl-3 text-sm text-secondary">
            <strong className="text-primary">Cambio relevante:</strong> el
            crecimiento proviene principalmente de clientes Frecuente y VIP.
          </p>
        </div>
        <div className="space-y-5">
          <div className="rounded-panel border bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Mejor campaña</h2>
              <Megaphone size={16} className="text-secondary" />
            </div>
            <p className="mt-4 text-sm font-medium">Vuelve este jueves</p>
            <p className="mt-1 text-xs text-secondary">
              18 clientes regresaron · {money(1640)}
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-subtle">
              <div className="h-full w-[72%] rounded-full bg-brand" />
            </div>
          </div>
          <div className="rounded-panel border bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Top embajadores</h2>
              <Users size={16} className="text-secondary" />
            </div>
            {[
              ["Mateo Vargas", "8 referidos"],
              ["Lucía Flores", "7 referidos"],
              ["Camila Rojas", "6 referidos"],
            ].map(([name, value]) => (
              <div
                key={name}
                className="flex items-center gap-2 border-b py-2.5 last:border-0"
              >
                <span className="grid size-7 place-items-center rounded-full bg-brand-subtle text-[10px] font-semibold">
                  {name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </span>
                <span className="flex-1 text-xs font-medium">{name}</span>
                <span className="text-xs text-secondary">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="rounded-panel border bg-surface">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Actividad reciente</h2>
          <Link
            to="/app/customers"
            className="text-xs font-medium text-secondary hover:text-primary"
          >
            Ver todo
          </Link>
        </div>
        <div className="grid md:grid-cols-2">
          {activity.map((item) => (
            <div
              key={item.name + item.action}
              className="flex items-center gap-3 border-b px-4 py-3 md:odd:border-r"
            >
              <UserRound size={16} className="text-tertiary" />
              <p className="min-w-0 flex-1 truncate text-xs">
                <strong>{item.name}</strong> {item.action}
              </p>
              <span className="text-xs text-secondary">{item.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
