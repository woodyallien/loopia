import { useDeferredValue, useState } from "react";
import {
  Filter,
  Gift,
  MessageCircle,
  Plus,
  QrCode,
  Search,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Button, Sheet } from "../components/ui";
import { customers } from "../data/mock";
import type { Customer } from "../lib/types";
import { money } from "../lib/utils";

const filters = [
  "Todos",
  "Nuevos",
  "Frecuentes",
  "VIP",
  "En riesgo",
  "Inactivos",
] as const;
type FilterName = (typeof filters)[number];
function matches(customer: Customer, filter: FilterName) {
  if (filter === "Todos") return true;
  if (filter === "Nuevos") return customer.status === "Nuevo";
  if (filter === "Frecuentes") return customer.status === "Frecuente";
  if (filter === "Inactivos") return customer.status === "Inactivo";
  return customer.status === filter;
}
function tone(status: string): "neutral" | "success" | "warning" | "gold" {
  if (status === "VIP") return "gold";
  if (status === "En riesgo") return "warning";
  if (status === "Inactivo") return "neutral";
  return "success";
}

export function Customers() {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState<FilterName>("Todos"),
    [selected, setSelected] = useState<Customer | null>(null),
    [advanced, setAdvanced] = useState(false);
  const deferred = useDeferredValue(query);
  const filtered = customers.filter(
    (customer) =>
      (customer.name.toLowerCase().includes(deferred.toLowerCase()) ||
        customer.phone.includes(deferred) ||
        customer.id.includes(deferred)) &&
      matches(customer, filter),
  );
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="mt-1 text-sm text-secondary">
            {filtered.length.toLocaleString()} clientes · conoce quién vuelve y
            quién necesita atención
          </p>
        </div>
        <Button>
          <UserPlus size={16} />
          Agregar cliente
        </Button>
      </header>
      <div className="sticky top-14 z-10 -mx-4 border-y bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-panel md:border">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1 lg:max-w-sm">
            <span className="sr-only">Buscar clientes</span>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
              size={16}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input h-10 min-h-10 pl-9"
              placeholder="Buscar por nombre, teléfono o código"
            />
          </label>
          <div
            className="hide-scroll flex gap-1 overflow-x-auto"
            aria-label="Segmentos rápidos"
          >
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={cnChip(filter === item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAdvanced((value) => !value)}
            aria-expanded={advanced}
            className="btn min-h-10 border bg-surface"
          >
            <SlidersHorizontal size={16} />
            Filtros avanzados{advanced && <Badge tone="gold">2</Badge>}
          </button>
        </div>
        {advanced && (
          <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="País"
              options={["Todos", "Perú", "Estados Unidos", "Canadá"]}
            />
            <Select label="Idioma" options={["Todos", "Español", "English"]} />
            <Select
              label="Nivel"
              options={[
                "Todos",
                "Explorador",
                "Viajero",
                "Frecuente",
                "Insider",
                "VIP",
              ]}
            />
            <Select
              label="Última visita"
              options={[
                "Cualquier fecha",
                "Últimos 7 días",
                "30+ días",
                "60+ días",
              ]}
            />
          </div>
        )}
      </div>
      <div className="hidden overflow-hidden rounded-panel border bg-surface md:block">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b bg-subtle/60 text-xs font-medium text-secondary">
            <tr>
              {[
                "Cliente",
                "Estado",
                "Nivel",
                "Visitas",
                "Gasto",
                "Puntos",
                "Última visita",
                "Referidos",
              ].map((label) => (
                <th key={label} className="px-3 py-2.5 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.slice(0, 20).map((customer) => (
              <tr
                key={customer.id}
                tabIndex={0}
                onClick={() => setSelected(customer)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(customer);
                  }
                }}
                className="cursor-pointer hover:bg-subtle/60 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar customer={customer} />
                    <div>
                      <p className="font-medium text-primary">
                        {customer.name}
                      </p>
                      <p className="text-xs text-secondary">
                        {customer.country} ·{" "}
                        {customer.language === "ES" ? "Español" : "English"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <Badge tone={tone(customer.status)}>{customer.status}</Badge>
                </td>
                <td className="px-3 py-2.5 text-secondary">{customer.tier}</td>
                <td className="px-3 py-2.5 tabular-nums">{customer.visits}</td>
                <td className="px-3 py-2.5 tabular-nums">
                  {money(customer.spend)}
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {customer.points.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-secondary">
                  {customer.lastVisit}
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {customer.referrals}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y rounded-panel border bg-surface md:hidden">
        {filtered.slice(0, 20).map((customer) => (
          <button
            key={customer.id}
            onClick={() => setSelected(customer)}
            className="flex min-h-[72px] w-full items-center gap-3 p-3 text-left"
          >
            <Avatar customer={customer} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{customer.name}</p>
              <p className="mt-0.5 text-xs text-secondary">
                {customer.tier} · {customer.visits} visitas ·{" "}
                {customer.lastVisit}
              </p>
            </div>
            <Badge tone={tone(customer.status)}>{customer.status}</Badge>
          </button>
        ))}
      </div>
      {!filtered.length && (
        <div className="rounded-panel border bg-surface p-12 text-center">
          <Filter className="mx-auto text-tertiary" />
          <h2 className="mt-3 font-semibold">No encontramos clientes</h2>
          <p className="mt-1 text-sm text-secondary">
            Prueba otro segmento o elimina filtros.
          </p>
        </div>
      )}
      <Sheet
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Vista rápida del cliente"
      >
        {selected && <CustomerQuickView customer={selected} />}
      </Sheet>
    </div>
  );
}

function CustomerQuickView({ customer }: { customer: Customer }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-4">
        <Avatar customer={customer} large />
        <div className="min-w-0">
          <h3 className="text-xl font-semibold">{customer.name}</h3>
          <p className="text-sm text-secondary">
            {customer.country} ·{" "}
            {customer.language === "ES" ? "Español" : "English"}
          </p>
          <div className="mt-2 flex gap-2">
            <Badge tone="gold">{customer.tier}</Badge>
            <Badge tone={tone(customer.status)}>{customer.status}</Badge>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-panel border bg-[rgb(var(--border-subtle))]">
        {[
          ["Puntos", customer.points.toLocaleString()],
          ["Visitas", customer.visits],
          ["Gasto", money(customer.spend)],
          ["Última visita", customer.lastVisit],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-surface p-4">
            <p className="text-xs text-secondary">{label}</p>
            <p className="metric-number mt-1 text-lg">{value}</p>
          </div>
        ))}
      </div>
      <div data-demo="customer-insight" className="mt-6 border-l-2 border-brand pl-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Insight
        </p>
        <p className="mt-1 text-sm leading-6">
          {customer.name.split(" ")[0]} suele visitar los viernes y
          probablemente responda a un incentivo de regreso.
        </p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button>
          <Plus size={16} />
          Dar puntos
        </Button>
        <Button variant="secondary">
          <QrCode size={16} />
          Registrar visita
        </Button>
        <Button variant="secondary">
          <MessageCircle size={16} />
          Enviar oferta
        </Button>
        <Button variant="secondary">
          <Gift size={16} />
          Recompensar
        </Button>
      </div>
      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-semibold">Actividad reciente</h4>
        <div className="divider-list mt-2">
          {[
            ["Hoy", "Visita · +108 puntos"],
            ["Hace 12 días", "Canjeó Café de la casa"],
            ["Hace 18 días", "Referido convertido · +150 puntos"],
          ].map(([date, event]) => (
            <div key={date} className="flex gap-3 py-3 text-sm">
              <span className="w-24 text-xs text-secondary">{date}</span>
              <span>{event}</span>
            </div>
          ))}
        </div>
      </div>
      <Link
        to={`/app/customers/${customer.id}`}
        className="btn mt-5 w-full bg-brand text-white dark:text-[#101513]"
      >
        Ver perfil completo
      </Link>
    </div>
  );
}
function Avatar({
  customer,
  large = false,
}: {
  customer: Customer;
  large?: boolean;
}) {
  return (
    <span
      className={
        large
          ? "grid size-14 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white"
          : "grid size-9 shrink-0 place-items-center rounded-full bg-brand-subtle text-xs font-semibold text-primary"
      }
    >
      {customer.initials}
    </span>
  );
}
function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-medium text-secondary">
        {label}
      </span>
      <select className="input h-10 min-h-10">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function cnChip(active: boolean) {
  return `min-h-10 shrink-0 rounded-control px-3 text-xs font-medium ${active ? "bg-brand text-white dark:text-[#101513]" : "text-secondary hover:bg-subtle"}`;
}
