import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { Badge, Button, Sheet } from "../components/ui";
import { money } from "../lib/utils";

type Location = {
  name: string;
  type: string;
  city: string;
  address: string;
  status: "Activo" | "Pausado";
  customers: number;
  visits: number;
  sales: number;
  staff: number;
  rewards: number;
  campaigns: number;
  qr: number;
};

const locations: Location[] = [
  {
    name: "Patio Central",
    type: "Restaurante",
    city: "Cusco",
    address: "Calle Plateros 327",
    status: "Activo",
    customers: 84,
    visits: 251,
    sales: 18420,
    staff: 6,
    rewards: 4,
    campaigns: 2,
    qr: 8,
  },
  {
    name: "Mirador 24",
    type: "Bar",
    city: "Cusco",
    address: "Cuesta San Blas 241",
    status: "Activo",
    customers: 47,
    visits: 168,
    sales: 15680,
    staff: 4,
    rewards: 3,
    campaigns: 1,
    qr: 5,
  },
  {
    name: "Café Piedra",
    type: "Café",
    city: "Cusco",
    address: "Calle Maruri 218",
    status: "Activo",
    customers: 62,
    visits: 194,
    sales: 14170,
    staff: 3,
    rewards: 3,
    campaigns: 2,
    qr: 6,
  },
];

export function Locations() {
  const [selected, setSelected] = useState<Location | null>(null);
  return (
    <div data-demo="locations-workspace" className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Locales</h1>
          <p className="mt-1 text-sm text-secondary">
            Gestiona dónde funciona tu programa.
          </p>
        </div>
        <Button>
          <Plus size={16} /> Nuevo local
        </Button>
      </header>

      <div className="hidden overflow-hidden rounded-panel border bg-surface md:block">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b bg-subtle/60 text-xs font-medium text-secondary">
            <tr>
              {[
                "Local",
                "Tipo",
                "Ciudad",
                "Estado",
                "Clientes",
                "Visitas",
                "Ventas registradas",
                "",
              ].map((label) => (
                <th
                  key={label || "actions"}
                  className="px-3 py-2.5 font-medium"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {locations.map((location) => (
              <tr
                key={location.name}
                tabIndex={0}
                onClick={() => setSelected(location)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(location);
                  }
                }}
                className="cursor-pointer hover:bg-subtle/60 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
              >
                <td className="px-3 py-3">
                  <p className="font-medium">{location.name}</p>
                  <p className="text-xs text-secondary">{location.address}</p>
                </td>
                <td className="px-3 py-3 text-secondary">{location.type}</td>
                <td className="px-3 py-3 text-secondary">{location.city}</td>
                <td className="px-3 py-3">
                  <Badge tone="success">{location.status}</Badge>
                </td>
                <td className="px-3 py-3 tabular-nums">{location.customers}</td>
                <td className="px-3 py-3 tabular-nums">{location.visits}</td>
                <td className="px-3 py-3 tabular-nums">
                  {money(location.sales)}
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    aria-label={`Opciones de ${location.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelected(location);
                    }}
                  >
                    <MoreHorizontal size={16} className="text-secondary" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y rounded-panel border bg-surface md:hidden">
        {locations.map((location) => (
          <button
            key={location.name}
            type="button"
            onClick={() => setSelected(location)}
            className="flex min-h-[72px] w-full items-center gap-3 p-3 text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{location.name}</p>
              <p className="mt-0.5 text-xs text-secondary">
                {location.type} · {location.city} · {location.customers}{" "}
                clientes
              </p>
            </div>
            <Badge tone="success">{location.status}</Badge>
          </button>
        ))}
      </div>

      <Sheet
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Vista rápida del local"
      >
        {selected && (
          <div className="space-y-5 p-5">
            <div>
              <h3 className="text-xl font-semibold">{selected.name}</h3>
              <p className="mt-1 text-sm text-secondary">
                {selected.type} · {selected.address}, {selected.city}
              </p>
              <div className="mt-2">
                <Badge tone="success">{selected.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border bg-[rgb(var(--border-subtle))]">
              {[
                ["Clientes", selected.customers],
                ["Visitas", selected.visits],
                ["Ventas", money(selected.sales)],
                ["Personal", selected.staff],
              ].map(([label, value]) => (
                <div key={label as string} className="bg-surface p-4">
                  <p className="text-xs text-secondary">{label}</p>
                  <p className="metric-number mt-1 text-lg">{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 text-sm">
              <Row
                label="Recompensas activas"
                value={String(selected.rewards)}
              />
              <Row label="Campañas" value={String(selected.campaigns)} />
              <Row label="Códigos QR" value={String(selected.qr)} />
              <Row label="Personal asignado" value={String(selected.staff)} />
            </div>
            <Button className="w-full">Ver rendimiento completo</Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2.5 last:border-0">
      <span className="text-secondary">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
