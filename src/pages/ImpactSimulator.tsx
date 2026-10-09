import { useState } from "react";
import { Calculator, Info, TrendingUp, UserPlus, Users } from "lucide-react";
import { Card } from "../components/ui";
import { money } from "../lib/utils";

export function ImpactSimulator() {
  const [monthly, setMonthly] = useState(1200);
  const [ticket, setTicket] = useState(68);
  const [capture, setCapture] = useState(35);
  const [returnRate, setReturnRate] = useState(12);
  const captured = Math.round((monthly * capture) / 100);
  const additionalVisits = Math.round((captured * returnRate) / 100);
  const sales = additionalVisits * ticket;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="eyebrow">Conversación comercial</p>
        <h1 className="page-title mt-2">Simulador de impacto</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Explora un escenario simple con el prospecto. Los resultados son
          estimaciones hipotéticas y no constituyen una promesa ni garantía de
          resultados.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <Card>
          <div className="flex items-center gap-2">
            <Calculator className="text-gold" />
            <h2 className="font-bold">Supuestos del negocio</h2>
          </div>
          <div className="mt-6 space-y-5">
            <Input
              label="Clientes por mes"
              value={monthly}
              setValue={setMonthly}
              min={0}
              suffix="clientes"
            />
            <Input
              label="Ticket promedio"
              value={ticket}
              setValue={setTicket}
              min={0}
              prefix="S/"
            />
            <Input
              label="Clientes que podrían captarse"
              value={capture}
              setValue={setCapture}
              min={0}
              max={100}
              suffix="%"
            />
            <Input
              label="Incremento esperado en retorno"
              value={returnRate}
              setValue={setReturnRate}
              min={0}
              max={100}
              suffix="%"
            />
          </div>
        </Card>
      <div data-demo="impact-summary" className="space-y-4">
          <p className="sr-only" role="status" aria-live="polite">
            Estimación actual: {captured} clientes captados, {additionalVisits}{" "}
            visitas adicionales potenciales y {money(sales)} en ventas
            incrementales estimadas.
          </p>
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">
            <Info className="mr-2 inline" size={17} />
            <strong>Estimación hipotética:</strong> estos valores dependen de
            adopción, operación, oferta y comportamiento real de los clientes.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Result
              icon={Users}
              label="Clientes captados"
              value={captured.toLocaleString()}
              detail={`${capture}% de ${monthly.toLocaleString()} clientes`}
            />
            <Result
              icon={UserPlus}
              label="Visitas adicionales potenciales"
              value={additionalVisits.toLocaleString()}
              detail={`${returnRate}% de los clientes captados`}
            />
            <Result
              icon={TrendingUp}
              label="Ventas incrementales estimadas"
              value={money(sales)}
              detail={`${additionalVisits} visitas × ${money(ticket)}`}
              wide
            />
          </div>
          <Card className="bg-ink text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-[#e7bd85]">
              Cómo explicarlo
            </p>
            <p className="mt-3 text-lg font-semibold leading-7">
              “Si logramos identificar a {captured} clientes y apenas{" "}
              {additionalVisits} regresan una vez más, el escenario
              representaría aproximadamente {money(sales)} en ventas
              adicionales.”
            </p>
            <p className="mt-3 text-xs text-stone-300">
              Ejemplo orientativo. No es una proyección financiera ni garantiza
              desempeño.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  setValue,
  min,
  max,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
  max?: number;
  prefix?: string;
  suffix?: string;
}) {
  const limit = max ?? (label.includes("Clientes") ? 5000 : 500);
  const change = (next: number) =>
    setValue(Math.max(min, Math.min(limit, next)));
  return (
    <label>
      <span className="label">{label}</span>
      <span className="relative block">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold">
            {prefix}
          </span>
        )}
        <input
          className={`input text-lg font-semibold tabular-nums ${prefix ? "pl-10" : ""} ${suffix ? "pr-16" : ""}`}
          type="number"
          min={min}
          max={limit}
          value={value}
          onChange={(event) => change(Number(event.target.value))}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
            {suffix}
          </span>
        )}
      </span>
      <input
        className="mt-3 h-2 w-full cursor-pointer accent-[rgb(var(--brand))]"
        aria-label={`${label} control deslizante`}
        type="range"
        min={min}
        max={limit}
        value={value}
        onChange={(event) => change(Number(event.target.value))}
      />
    </label>
  );
}

function Result({
  icon: Icon,
  label,
  value,
  detail,
  wide = false,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  detail: string;
  wide?: boolean;
}) {
  return (
    <Card className={wide ? "sm:col-span-2" : ""}>
      <Icon className="text-gold" />
      <p className="mt-5 text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-muted">{detail}</p>
      <BadgeEstimate />
    </Card>
  );
}
function BadgeEstimate() {
  return (
    <span className="mt-4 inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700 dark:bg-white/10 dark:text-stone-200">
      Estimación hipotética
    </span>
  );
}
