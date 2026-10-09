import { useEffect, useState } from "react";
import { Check, Gift, Keyboard, QrCode, Search, Sparkles } from "lucide-react";
import { Button } from "../components/ui";
import { customers } from "../data/mock";
import { calculatePoints, money } from "../lib/utils";
import { useApp } from "../context/AppContext";
import { demoScenarios } from "../data/scenarios";

const history = [
  ["Carlos Quispe", "Patio Central", "Hoy 12:40", 83, 108, "—"],
  ["Sofía Mendoza", "Patio Central", "Hoy 11:15", 146, 171, "—"],
  ["James Smith", "Mirador 24", "Hoy 10:02", 0, 0, "Café de la casa"],
  ["Lucía Flores", "Café Piedra", "Ayer 18:20", 54, 79, "—"],
  ["Mateo Vargas", "Patio Central", "Ayer 14:05", 120, 145, "—"],
] as const;

export function Visits() {
  const { scenario, user } = useApp();
  const isStaff = user?.role === "staff";
  const [mode, setMode] = useState<"history" | "register">(
    isStaff ? "register" : "history",
  );
  const [step, setStep] = useState<"find" | "confirm" | "done">("find");
  const [amount, setAmount] = useState(120);
  const [manual, setManual] = useState(50);
  const customer =
    customers.find(
      (item) => item.name === demoScenarios[scenario].featuredCustomer,
    ) || customers[0];
  const points = calculatePoints(amount, customer.visits, manual);

  useEffect(() => {
    setMode(isStaff ? "register" : "history");
  }, [isStaff]);
  useEffect(() => {
    if (step !== "find") document.getElementById(`visit-step-${step}`)?.focus();
  }, [step]);

  if (!isStaff && mode === "history") {
    return (
      <div className="space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Visitas</h1>
            <p className="mt-1 text-sm text-secondary">
              Historial operativo de registros y canjes.
            </p>
          </div>
          <Button
            onClick={() => {
              setMode("register");
              setStep("find");
            }}
          >
            <QrCode size={16} /> Registrar visita
          </Button>
        </header>
        <section
          aria-label="Resumen del día"
          className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-3"
        >
          {[
            ["Visitas hoy", "18"],
            ["Ventas registradas", money(2140)],
            ["Puntos emitidos", "2,460"],
          ].map(([label, value], index) => (
            <div
              key={label}
              className={`p-4 ${index ? "border-t sm:border-l sm:border-t-0" : ""}`}
            >
              <p className="text-xs font-medium text-secondary">{label}</p>
              <p className="metric-number mt-2 text-2xl">{value}</p>
            </div>
          ))}
        </section>
        <div className="hidden overflow-hidden rounded-panel border bg-surface md:block">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b bg-subtle/60 text-xs font-medium text-secondary">
              <tr>
                {[
                  "Cliente",
                  "Local",
                  "Fecha",
                  "Compra",
                  "Puntos",
                  "Recompensa",
                ].map((label) => (
                  <th key={label} className="px-3 py-2.5 font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((row) => (
                <tr key={row.join("-")} className="hover:bg-subtle/60">
                  <td className="px-3 py-3 font-medium">{row[0]}</td>
                  <td className="px-3 py-3 text-secondary">{row[1]}</td>
                  <td className="px-3 py-3 text-secondary">{row[2]}</td>
                  <td className="px-3 py-3 tabular-nums">
                    {row[3] ? money(row[3]) : "—"}
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {row[4] ? `+${row[4]}` : "—"}
                  </td>
                  <td className="px-3 py-3 text-secondary">{row[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y rounded-panel border bg-surface md:hidden">
          {history.map((row) => (
            <div key={row.join("-")} className="p-3">
              <p className="text-sm font-medium">{row[0]}</p>
              <p className="mt-0.5 text-xs text-secondary">
                {row[1]} · {row[2]} · {row[4] ? `+${row[4]} pts` : row[5]}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {!isStaff && (
        <button
          type="button"
          onClick={() => setMode("history")}
          className="mb-4 text-sm font-medium text-secondary hover:text-primary"
        >
          ← Volver al historial
        </button>
      )}
      <div className="text-center">
        <p className="eyebrow">Atención rápida</p>
        <h1 className="page-title mt-2">Escanear cliente</h1>
        <p className="mt-2 text-sm text-secondary">
          Registra una visita, suma puntos o valida una recompensa en segundos.
        </p>
      </div>
      {step === "find" && (
        <div data-demo="visit-flow" className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setStep("confirm")}
            className="flex min-h-56 flex-col items-center justify-center rounded-panel border border-dashed bg-surface hover:border-brand"
          >
            <span className="grid size-16 place-items-center rounded-panel bg-brand-subtle text-brand">
              <QrCode size={32} />
            </span>
            <strong className="mt-4 text-lg">Escanear QR</strong>
            <span className="mt-1 text-sm text-secondary">
              Usar la cámara del dispositivo
            </span>
          </button>
          <div className="flex min-h-56 flex-col justify-center rounded-panel border bg-surface p-5">
            <Keyboard className="text-brand" size={28} />
            <h2 className="mt-3 text-lg font-semibold">Ingresar código</h2>
            <label className="relative mt-4">
              <span className="sr-only">Código del cliente</span>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
                size={18}
              />
              <input className="input pl-10" defaultValue="CUS-0001" />
            </label>
            <Button className="mt-3" onClick={() => setStep("confirm")}>
              Buscar cliente
            </Button>
          </div>
        </div>
      )}
      {step === "confirm" && (
        <div className="mt-8 rounded-panel border bg-surface p-5 sm:p-7">
          <div className="flex items-center gap-4 border-b pb-5">
            <span className="grid size-14 place-items-center rounded-full bg-brand text-sm font-semibold text-white dark:text-[#101513]">
              {customer.initials}
            </span>
            <div className="flex-1">
              <p className="text-xs text-secondary">Cliente encontrado</p>
              <h2
                id="visit-step-confirm"
                tabIndex={-1}
                className="text-xl font-semibold"
              >
                {customer.name}
              </h2>
              <p className="text-sm text-secondary">
                {customer.tier} · {customer.points.toLocaleString()} puntos
              </p>
            </div>
            <span className="hidden items-center gap-1 text-xs font-semibold text-success sm:flex">
              <Check size={15} /> Verificado
            </span>
          </div>
          <div className="py-6">
            <label>
              <span className="label">Compra de hoy</span>
              <span className="relative block">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold">
                  S/
                </span>
                <input
                  aria-label="Compra de hoy"
                  className="input h-16 pl-12 text-2xl font-semibold"
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                />
              </span>
            </label>
            <label className="mt-4 block">
              <span className="label">Bono manual (opcional)</span>
              <input
                aria-label="Bono manual"
                className="input"
                type="number"
                min={0}
                value={manual}
                onChange={(event) => setManual(Number(event.target.value))}
              />
            </label>
            <div className="mt-6 rounded-panel bg-subtle p-5">
              <PointLine label="Compra" value={points.base} />
              <PointLine label="Visita" value={points.visit} />
              {points.milestone > 0 && (
                <PointLine
                  label="Hito de visitas"
                  value={points.milestone}
                  highlight
                />
              )}
              {manual > 0 && <PointLine label="Bono" value={manual} />}
              <div className="mt-4 flex items-end justify-between border-t pt-4">
                <strong>Total</strong>
                <strong className="metric-number text-3xl text-brand">
                  +{points.total}
                </strong>
              </div>
              <p className="mt-1 text-right text-xs text-secondary">puntos</p>
            </div>
          </div>
          <Button
            className="h-14 w-full text-base"
            aria-label="Registrar visita y puntos"
            onClick={() => setStep("done")}
          >
            CONFIRMAR VISITA
          </Button>
          <Button variant="secondary" className="mt-3 w-full">
            <Gift size={17} /> Canjear recompensa
          </Button>
        </div>
      )}
      {step === "done" && (
        <div className="mt-8 rounded-panel border bg-surface py-12 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-subtle text-brand motion-safe:animate-[pulse_600ms_ease-out_1]">
            <Check size={32} />
          </span>
          <p className="metric-number mt-5 text-4xl text-brand">
            ¡+{points.total} puntos!
          </p>
          <h2
            id="visit-step-done"
            tabIndex={-1}
            className="mt-3 text-xl font-semibold"
          >
            Visita registrada
          </h2>
          <p role="status" className="mt-2 text-secondary">
            {money(amount)} · {customer.name.split(" ")[0]} ahora tiene{" "}
            {(customer.points + points.total).toLocaleString()} puntos
          </p>
          <Button className="mx-auto mt-7" onClick={() => setStep("find")}>
            Escanear otro cliente
          </Button>
        </div>
      )}
    </div>
  );
}

function PointLine({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`mb-3 flex justify-between text-sm ${highlight ? "font-semibold text-brand" : ""}`}
    >
      <span className="flex items-center gap-1">
        {highlight && <Sparkles size={15} />}
        {label}
      </span>
      <strong>+{value}</strong>
    </div>
  );
}
