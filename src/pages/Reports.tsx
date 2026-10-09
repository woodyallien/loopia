import { Download } from "lucide-react";
import { GrowthChart } from "../components/Charts";
import { Badge, Button } from "../components/ui";
export function Reports() {
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Análisis</p>
          <h1 className="page-title mt-1">¿Están regresando más clientes?</h1>
          <p className="mt-1.5 text-sm text-secondary">
            Compara recurrencia, segmentos y locales antes de tomar una
            decisión.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => alert("CSV de demostración generado")}
        >
          <Download size={16} />
          Exportar CSV
        </Button>
      </header>
      <div className="sticky top-14 z-10 flex flex-wrap gap-2 rounded-panel border bg-background/95 p-2 backdrop-blur">
        <select className="input h-9 min-h-9 w-auto text-xs">
          <option>Últimos 6 meses</option>
          <option>90 días</option>
        </select>
        <select className="input h-9 min-h-9 w-auto text-xs">
          <option>vs. periodo anterior</option>
        </select>
        <select className="input h-9 min-h-9 w-auto text-xs">
          <option>Todos los locales</option>
        </select>
        <select className="input h-9 min-h-9 w-auto text-xs">
          <option>Todos los segmentos</option>
        </select>
      </div>
      <section data-demo="reports-result" className="rounded-panel border bg-surface p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-secondary">
              Tasa de retorno
            </p>
            <p className="metric-number mt-1 text-4xl">32.4%</p>
            <p className="mt-2 text-xs font-medium text-success">
              +18% frente al periodo anterior
            </p>
          </div>
          <Badge tone="success">Mejora</Badge>
        </div>
        <div className="mt-4">
          <GrowthChart />
        </div>
        <div className="mt-3 border-l-2 border-brand pl-3">
          <p className="text-sm">
            <strong>Qué cambió:</strong> la mejora fue impulsada por clientes
            Frecuente y VIP de Patio Central.
          </p>
          <button className="mt-1 text-xs font-semibold text-brand">
            Ver desglose del segmento →
          </button>
        </div>
      </section>
      <section className="overflow-hidden rounded-panel border bg-surface">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Desglose por local</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-subtle/60 text-xs text-secondary">
            <tr>
              {["Local", "Clientes", "Retorno", "Cambio"].map((x) => (
                <th key={x} className="px-4 py-2 font-medium">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Patio Central", "612", "36.8%", "+21%"],
              ["Mirador 24", "381", "29.4%", "+12%"],
              ["Café Piedra", "291", "27.1%", "+9%"],
            ].map((row) => (
              <tr key={row[0]} className="border-t">
                {row.map((cell, index) => (
                  <td
                    key={cell}
                    className={`px-4 py-3 ${index === 3 ? "font-medium text-success" : ""}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
