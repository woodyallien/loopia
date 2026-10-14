import { useDeferredValue, useRef, useState, type FormEvent } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, Sheet } from "../components/ui";
import { useOperations } from "../context/OperationsContext";
import { daysSince, relativeTime, usablePoints } from "../lib/analytics";
import { rewards } from "../data/mock";
import type { StoredCustomer } from "../lib/operations";
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
function matches(customer: StoredCustomer, filter: FilterName) {
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
  const navigate = useNavigate();
  const operations = useOperations();
  const customers = operations.customers;
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState<FilterName>("Todos"),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [advanced, setAdvanced] = useState(false),
    [adding, setAdding] = useState(false),
    [country, setCountry] = useState("Todos"),
    [language, setLanguage] = useState("Todos"),
    [tier, setTier] = useState("Todos"),
    [recency, setRecency] = useState("Cualquier fecha"),
    [notice, setNotice] = useState("");
  const selected = customers.find((customer) => customer.id === selectedId) ?? null;
  const deferred = useDeferredValue(query);
  const advancedCount = [country, language, tier].filter((value) => value !== "Todos").length + (recency === "Cualquier fecha" ? 0 : 1);
  const filtered = customers.filter((customer) => {
    const days = daysSince(customer.lastVisit);
    const recencyOk = recency === "Cualquier fecha" || (recency === "Últimos 7 días" && days <= 7) || (recency === "30+ días" && days >= 30) || (recency === "60+ días" && days >= 60);
    return (
      (customer.name.toLowerCase().includes(deferred.toLowerCase()) ||
        customer.phone.includes(deferred) ||
        customer.id.includes(deferred)) &&
      matches(customer, filter) &&
      (country === "Todos" || customer.country === country) &&
      (language === "Todos" || (language === "Español" ? customer.language === "ES" : customer.language === "EN")) &&
      (tier === "Todos" || customer.tier === tier) &&
      recencyOk
    );
  });
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
        <div className="flex flex-wrap gap-2">
          {operations.duplicates.length > 0 && (
            <Button variant="secondary" onClick={() => operations.duplicates.forEach((group) => operations.mergeCustomers(group[0].id, group[1].id))}>
              Combinar duplicados ({operations.duplicates.length})
            </Button>
          )}
          <Button onClick={() => setAdding(true)}>
            <UserPlus size={16} />
            Agregar cliente
          </Button>
        </div>
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
            Filtros avanzados{advancedCount > 0 && <Badge tone="gold">{advancedCount}</Badge>}
          </button>
        </div>
        {advanced && (
          <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select label="País" value={country} onChange={setCountry} options={["Todos", "Perú", "Estados Unidos", "Canadá"]} />
            <Select label="Idioma" value={language} onChange={setLanguage} options={["Todos", "Español", "English"]} />
            <Select label="Nivel" value={tier} onChange={setTier} options={["Todos", "Explorador", "Viajero", "Frecuente", "Insider", "VIP"]} />
            <Select label="Última visita" value={recency} onChange={setRecency} options={["Cualquier fecha", "Últimos 7 días", "30+ días", "60+ días"]} />
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
                onClick={() => setSelectedId(customer.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(customer.id);
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
                  {usablePoints(customer, operations.settings.rules.expirationDays).toLocaleString()}
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
            onClick={() => setSelectedId(customer.id)}
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
        onClose={() => setSelectedId(null)}
        title="Vista rápida del cliente"
      >
        {selected && (
          <CustomerQuickView
            customer={selected}
            expirationDays={operations.settings.rules.expirationDays}
            visits={operations.visits.filter((visit) => visit.customerId === selected.id).slice(0, 4)}
            notice={notice}
            onPoints={(delta) => {
              const result = operations.adjustPoints(selected.id, delta, "María Salazar");
              setNotice(result.ok ? `Se acreditaron ${delta} puntos.` : "No se pudieron acreditar puntos. Revisa el tope diario o el teléfono del personal.");
            }}
            onVisit={() => navigate("/app/visits", { state: { customerId: selected.id } })}
            onOffer={() => {
              operations.sendOffer(selected);
              setNotice(`Oferta de WhatsApp preparada para ${selected.name.split(" ")[0]}.`);
            }}
            onReward={() => {
              const balance = usablePoints(selected, operations.settings.rules.expirationDays);
              const reward = rewards.find((item) => item.active && item.points <= balance);
              if (!reward) {
                setNotice("No hay una recompensa que pueda canjear ahora.");
                return;
              }
              const result = operations.redeemReward(selected.id, reward, "María Salazar", "Mostrador");
              setNotice(result.ok ? `Canjeaste ${reward.name}.` : "No se pudo canjear la recompensa.");
            }}
          />
        )}
      </Sheet>
      <Sheet open={adding} onClose={() => setAdding(false)} title="Agregar cliente">
        <AddCustomer
          onClose={() => setAdding(false)}
          onCreate={(input) => operations.createCustomer(input)}
          onMerge={(keepId) => {
            setAdding(false);
            setSelectedId(keepId);
          }}
        />
      </Sheet>
    </div>
  );
}

function CustomerQuickView({ customer, visits, notice, expirationDays, onPoints, onVisit, onOffer, onReward }: { customer: StoredCustomer; expirationDays: number; visits: { id: string; at: string; points: number; rewardName: string | null; amount: number }[]; notice: string; onPoints: (delta: number) => void; onVisit: () => void; onOffer: () => void; onReward: () => void }) {
  const [bonus, setBonus] = useState(50);
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
          ["Puntos", usablePoints(customer, expirationDays).toLocaleString()],
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
      <div className="mt-6 grid grid-cols-[1fr_auto] gap-2">
        <input className="input" type="number" min={1} aria-label="Puntos a acreditar" value={bonus} onChange={(event) => setBonus(Number(event.target.value))} />
        <Button onClick={() => onPoints(bonus)}>
          <Plus size={16} />
          Dar puntos
        </Button>
      </div>
      {notice && <p role="status" className="mt-3 text-sm text-secondary">{notice}</p>}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onVisit}>
          <QrCode size={16} />
          Registrar visita
        </Button>
        <Button variant="secondary" onClick={onOffer}>
          <MessageCircle size={16} />
          Enviar oferta
        </Button>
        <Button variant="secondary" onClick={onReward}>
          <Gift size={16} />
          Recompensar
        </Button>
      </div>
      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-semibold">Actividad reciente</h4>
        <div className="divider-list mt-2">
          {visits.length ? visits.map((visit) => (
            <div key={visit.id} className="flex gap-3 py-3 text-sm">
              <span className="w-24 text-xs text-secondary">{relativeTime(visit.at)}</span>
              <span>{visit.rewardName ? `Canjeó ${visit.rewardName}` : visit.amount ? `Visita · ${visit.points > 0 ? "+" : ""}${visit.points} puntos` : `${visit.points > 0 ? "+" : ""}${visit.points} puntos`}</span>
            </div>
          )) : <p className="py-3 text-sm text-secondary">Todavía no hay movimientos registrados.</p>}
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
function AddCustomer({ onClose, onCreate, onMerge }: { onClose: () => void; onCreate: (input: { name: string; phone: string; email?: string; birthday?: string; force?: boolean }) => { ok: true; customer: StoredCustomer } | { ok: false; reason: "duplicate"; existing: StoredCustomer }; onMerge: (keepId: string) => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [duplicate, setDuplicate] = useState<StoredCustomer | null>(null);
  const submit = (event: FormEvent<HTMLFormElement> | null, force = false) => {
    event?.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    const result = onCreate({
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      birthday: String(data.get("birthday") || ""),
      force,
    });
    if (!result.ok) {
      setDuplicate(result.existing);
      return;
    }
    onMerge(result.customer.id);
    onClose();
  };
  return (
    <form ref={formRef} className="space-y-4 p-5" onSubmit={(event) => submit(event)}>
      <label><span className="label">Nombre</span><input className="input" name="name" required /></label>
      <label><span className="label">Teléfono</span><input className="input" name="phone" required /></label>
      <label><span className="label">Correo</span><input className="input" name="email" type="email" /></label>
      <label><span className="label">Cumpleaños</span><input className="input" name="birthday" type="date" /></label>
      {duplicate && (
        <div className="rounded-control bg-subtle p-3 text-sm">
          <p>Ya existe {duplicate.name} con este teléfono.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={() => onMerge(duplicate.id)}>Usar el registro existente</Button>
            <Button type="button" variant="secondary" onClick={() => submit(null, true)}>Crear registro aparte</Button>
          </div>
        </div>
      )}
      <Button type="submit" className="w-full">Guardar cliente</Button>
    </form>
  );
}
function Avatar({
  customer,
  large = false,
}: {
  customer: StoredCustomer;
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
function Select({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-medium text-secondary">
        {label}
      </span>
      <select className="input h-10 min-h-10" aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
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
