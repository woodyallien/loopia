import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, Delete, Gift, Keyboard, QrCode, Search, Sparkles, Undo2 } from "lucide-react";
import { Button, Empty } from "../components/ui";
import { useApp } from "../context/AppContext";
import { useOperations } from "../context/OperationsContext";
import { demoScenarios } from "../data/scenarios";
import { rewards } from "../data/mock";
import { relativeTime, sameDay, usablePoints } from "../lib/analytics";
import { tierLabel } from "../lib/i18n";
import { findCustomer, isStaffPhone, previewAward, type StoredCustomer, type VisitRecord } from "../lib/operations";
import { useTr } from "../lib/useTr";
import { money } from "../lib/utils";

const quickAmounts = [20, 50, 100];
const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"] as const;

export function Visits() {
  const { scenario, user, language } = useApp();
  const tr = useTr();
  const operations = useOperations();
  const route = useLocation();
  const isStaff = user?.role === "staff";
  const locations = demoScenarios[scenario].locations;
  const [mode, setMode] = useState<"history" | "register">(isStaff ? "register" : "history");
  const [step, setStep] = useState<"find" | "confirm" | "done">("find");
  const [code, setCode] = useState("CUS-0001");
  const [amountText, setAmountText] = useState("120");
  const [freshAmount, setFreshAmount] = useState(true);
  const [manual, setManual] = useState(0);
  const [place, setPlace] = useState(locations[0]);
  const [found, setFound] = useState<StoredCustomer | null>(null);
  const [rewardId, setRewardId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [lastVisit, setLastVisit] = useState<VisitRecord | null>(null);
  const [credited, setCredited] = useState(0);
  const handledRoute = useRef<string | null>(null);
  const amount = Number(amountText) || 0;
  const customer = found ? operations.customers.find(item => item.id === found.id) ?? found : null;
  const rules = operations.settings.rules;
  const points = customer ? previewAward(customer, amount, manual, rules, operations.visits) : null;
  const balance = customer ? usablePoints(customer, rules.expirationDays) : 0;
  const affordable = rewards.filter(reward => reward.active && reward.points <= balance);
  const staffBlocked = tr("Este número pertenece al personal y no puede acumular puntos.", "This number belongs to staff and cannot earn points.");

  useEffect(() => {
    setMode(isStaff ? "register" : "history");
  }, [isStaff]);
  useEffect(() => {
    if (!locations.includes(place)) setPlace(locations[0]);
  }, [locations, place]);
  const requestedId = (route.state as { customerId?: string } | null)?.customerId;
  useEffect(() => {
    if (!requestedId || handledRoute.current === requestedId) return;
    const match = operations.customers.find(item => item.id === requestedId);
    if (!match) return;
    handledRoute.current = requestedId;
    setFound(match);
    setStep("confirm");
    setMode("register");
  }, [requestedId, operations.customers]);
  useEffect(() => {
    if (step !== "find") document.getElementById(`visit-step-${step}`)?.focus();
  }, [step]);

  const featured = operations.customers.find(item => item.name === demoScenarios[scenario].featuredCustomer) || operations.customers[0];
  const openCustomer = (match: StoredCustomer | undefined) => {
    if (!match) {
      setError(tr("No encontramos un cliente con ese código o teléfono.", "No customer matches that code or phone."));
      return;
    }
    if (isStaffPhone(match.phone, rules)) {
      setError(staffBlocked);
      return;
    }
    setError("");
    setFound(match);
    setRewardId(null);
    pickAmount("120");
    setManual(0);
    setStep("confirm");
  };
  const scan = () => {
    const pending = sessionStorage.getItem("loopia-scan-code");
    const scanned = pending ? operations.customers.find(item => item.id === pending) : undefined;
    openCustomer(scanned || featured);
  };
  const pickAmount = (value: string) => {
    setAmountText(value);
    setFreshAmount(true);
  };
  const press = (key: (typeof keypad)[number]) => {
    const replace = freshAmount;
    setFreshAmount(false);
    setAmountText(previous => {
      const current = replace && key !== "back" ? "" : previous;
      if (key === "back") return current.slice(0, -1);
      if (key === "." && current === "") return "0.";
      if (key === "." && current.includes(".")) return current;
      if (current.includes(".") && current.split(".")[1].length >= 2) return current;
      if (current === "0" && key !== ".") return key;
      if (current.length >= 7) return current;
      return current + key;
    });
  };
  const confirm = () => {
    if (!customer || !points) return;
    const reward = rewards.find(item => item.id === rewardId) ?? null;
    const result = operations.commitVisit({
      customerId: customer.id,
      amount,
      manual: Number.isFinite(manual) ? manual : 0,
      location: place,
      staffName: user?.name ?? "Personal",
      reward,
    });
    if (!result.ok) {
      setError(
        result.reason === "staff-blocked" ? staffBlocked
          : result.reason === "daily-cap" ? tr("Este cliente ya alcanzó el tope de puntos de hoy.", "This customer already hit today's points cap.")
          : result.reason === "insufficient-points" ? tr("No tiene puntos suficientes para esa recompensa.", "Not enough points for that reward.")
          : tr("No pudimos registrar la visita.", "We could not record the visit."),
      );
      return;
    }
    setLastVisit(result.visit);
    setCredited(result.awarded.awarded);
    setError("");
    setStep("done");
  };
  const reset = () => {
    setStep("find");
    setRewardId(null);
    setError("");
  };

  if (!isStaff && mode === "history") {
    const today = operations.visits.filter(visit => sameDay(visit.at));
    const recent = operations.visits.slice(0, 12);
    return (
      <div className="space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">{tr("Visitas", "Visits")}</h1>
            <p className="mt-1 text-sm text-secondary">{tr("Historial operativo de registros y canjes.", "Log of recorded visits and redemptions.")}</p>
          </div>
          <Button onClick={() => { setMode("register"); reset(); }}>
            <QrCode size={16} /> {tr("Registrar visita", "Record visit")}
          </Button>
        </header>
        <section aria-label={tr("Resumen del día", "Today's summary")} className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-3">
          {[
            [tr("Visitas hoy", "Visits today"), String(today.length)],
            [tr("Ventas registradas", "Recorded sales"), money(today.reduce((sum, visit) => sum + visit.amount, 0))],
            [tr("Puntos emitidos", "Points issued"), today.reduce((sum, visit) => sum + Math.max(0, visit.points), 0).toLocaleString("es-PE")],
          ].map(([label, value], index) => (
            <div key={label} className={`p-4 ${index ? "border-t sm:border-l sm:border-t-0" : ""}`}>
              <p className="text-xs font-medium text-secondary">{label}</p>
              <p className="metric-number mt-2 text-2xl">{value}</p>
            </div>
          ))}
        </section>
        {recent.length === 0 ? (
          <div className="rounded-panel border bg-surface">
            <Empty icon={<QrCode />} title={tr("Aún no hay visitas", "No visits yet")} text={tr("Registra la primera visita para empezar el historial.", "Record the first visit to start the log.")} />
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-panel border bg-surface md:block">
              <table className="w-full text-left text-[13px]">
                <thead className="border-b bg-subtle/60 text-xs font-medium text-secondary">
                  <tr>{[tr("Cliente", "Customer"), tr("Local", "Location"), tr("Fecha", "Date"), tr("Compra", "Purchase"), tr("Puntos", "Points"), tr("Recompensa", "Reward")].map(label => <th key={label} className="px-3 py-2.5 font-medium">{label}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {recent.map(visit => (
                    <tr key={visit.id} className="hover:bg-subtle/60">
                      <td className="px-3 py-3 font-medium">{visit.customerName}</td>
                      <td className="px-3 py-3 text-secondary">{visit.location}</td>
                      <td className="px-3 py-3 text-secondary">{relativeTime(visit.at, language)}</td>
                      <td className="px-3 py-3 tabular-nums">{visit.amount ? money(visit.amount) : "—"}</td>
                      <td className="px-3 py-3 tabular-nums">{visit.points > 0 ? `+${visit.points}` : visit.points < 0 ? visit.points : "—"}</td>
                      <td className="px-3 py-3 text-secondary">{visit.rewardName ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="divide-y rounded-panel border bg-surface md:hidden">
              {recent.map(visit => (
                <div key={visit.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{visit.customerName}</p>
                    <p className="mt-0.5 text-xs text-secondary">{visit.location} · {relativeTime(visit.at, language)}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold tabular-nums">{visit.points > 0 ? `+${visit.points} pts` : visit.rewardName ?? "—"}</p>
                    {visit.amount > 0 && <p className="text-secondary tabular-nums">{money(visit.amount)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {!isStaff && (
        <button type="button" onClick={() => setMode("history")} className="mb-4 text-sm font-medium text-secondary hover:text-primary">
          ← {tr("Volver al historial", "Back to log")}
        </button>
      )}
      <div className="text-center">
        <p className="eyebrow">{tr("Atención rápida", "Quick service")}</p>
        <h1 className="page-title mt-2">{tr("Escanear cliente", "Scan customer")}</h1>
        <p className="mt-2 text-sm text-secondary">{tr("Registra una visita, suma puntos o valida una recompensa en segundos.", "Record a visit, add points, or validate a reward in seconds.")}</p>
      </div>
      {error && step === "find" && <p role="alert" className="mt-4 rounded-control bg-[rgb(var(--danger)/.1)] px-3 py-2 text-sm text-danger">{error}</p>}
      {step === "find" && (
        <div data-demo="visit-flow" className="mt-8 grid gap-4 sm:grid-cols-2">
          <button onClick={scan} className="flex min-h-56 flex-col items-center justify-center rounded-panel border border-dashed bg-surface hover:border-brand">
            <span className="grid size-16 place-items-center rounded-panel bg-brand-subtle text-brand"><QrCode size={32} /></span>
            <strong className="mt-4 text-lg">{tr("Escanear QR", "Scan QR")}</strong>
            <span className="mt-1 text-sm text-secondary">{tr("Usar la cámara del dispositivo", "Use the device camera")}</span>
          </button>
          <form
            className="flex min-h-56 flex-col justify-center rounded-panel border bg-surface p-5"
            onSubmit={event => { event.preventDefault(); openCustomer(findCustomer(operations.customers, code)); }}
          >
            <Keyboard className="text-brand" size={28} />
            <h2 className="mt-3 text-lg font-semibold">{tr("Ingresar código", "Enter code")}</h2>
            <label className="relative mt-4">
              <span className="sr-only">{tr("Código del cliente", "Customer code")}</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={18} />
              <input className="input pl-10" value={code} placeholder={tr("Código o teléfono", "Code or phone")} onChange={event => setCode(event.target.value)} />
            </label>
            <Button type="submit" className="mt-3">{tr("Buscar cliente", "Find customer")}</Button>
          </form>
        </div>
      )}
      {step === "confirm" && customer && points && (
        <div className="mt-6 rounded-panel border bg-surface p-4 sm:p-6">
          <div className="flex items-center gap-4 border-b pb-4">
            <span className="grid size-12 place-items-center rounded-full bg-brand text-sm font-semibold text-white dark:text-[#101513]">{customer.initials}</span>
            <div className="min-w-0 flex-1">
              <h2 id="visit-step-confirm" tabIndex={-1} className="truncate text-lg font-semibold">{customer.name}</h2>
              <p className="text-sm text-secondary">
                {tierLabel(language, customer.tier)} · {balance.toLocaleString("es-PE")} {tr("puntos", "points")}
                {rules.expirationDays > 0 && balance !== customer.points ? tr(" disponibles", " available") : ""}
              </p>
            </div>
            <span className="hidden items-center gap-1 text-xs font-semibold text-success sm:flex"><Check size={15} /> {tr("Verificado", "Verified")}</span>
          </div>
          <div className="grid gap-5 py-5 md:grid-cols-[1fr_220px]">
            <div>
              <label className="block">
                <span className="label">{tr("Compra de hoy", "Today's purchase")}</span>
                <span className="relative block">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-secondary">S/</span>
                  <input
                    aria-label="Compra de hoy"
                    className="input h-20 pl-14 text-right text-4xl font-semibold tabular-nums"
                    inputMode="decimal"
                    value={amountText}
                    onChange={event => { setAmountText(event.target.value.replace(/[^\d.]/g, "")); setFreshAmount(false); }}
                  />
                </span>
              </label>
              <div className="mt-3 flex gap-2">
                {quickAmounts.map(value => (
                  <button key={value} type="button" onClick={() => pickAmount(String(value))} aria-pressed={amount === value} className={`h-11 flex-1 rounded-control border text-sm font-semibold ${amount === value ? "border-brand bg-brand-subtle text-brand" : "bg-surface hover:border-brand"}`}>
                    S/ {value}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label={tr("Teclado numérico", "Number pad")}>
                {keypad.map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => press(key)}
                    aria-label={key === "back" ? tr("Borrar dígito", "Delete digit") : key}
                    className="grid h-14 place-items-center rounded-control bg-subtle text-xl font-semibold active:scale-95 active:bg-brand-subtle motion-reduce:active:scale-100"
                  >
                    {key === "back" ? <Delete size={20} /> : key}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <label>
                <span className="label">{tr("Local", "Location")}</span>
                <select className="input" aria-label={tr("Local de la visita", "Visit location")} value={place} onChange={event => setPlace(event.target.value)}>
                  {locations.map(item => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span className="label">{tr("Bono manual (opcional)", "Manual bonus (optional)")}</span>
                <input aria-label={tr("Bono manual", "Manual bonus")} className="input" type="number" min={0} value={manual} onChange={event => setManual(Number(event.target.value))} />
              </label>
              <div className="rounded-panel bg-subtle p-4">
                <PointLine label={tr("Compra", "Purchase")} value={points.base} />
                <PointLine label={tr("Visita", "Visit")} value={points.visit} />
                {points.milestone > 0 && <PointLine label={tr("Hito de visitas", "Visit milestone")} value={points.milestone} highlight />}
                {points.manual > 0 && <PointLine label={tr("Bono", "Bonus")} value={points.manual} />}
                {rewardId && <PointLine label={tr("Canje", "Redemption")} value={-(rewards.find(item => item.id === rewardId)?.points ?? 0)} />}
                <div className="mt-3 flex items-end justify-between border-t pt-3">
                  <strong className="text-sm">Total</strong>
                  <strong className="metric-number text-3xl text-brand">+{points.awarded}</strong>
                </div>
                {points.capped && <p className="mt-1 text-right text-xs text-secondary">{tr(`tope diario de ${rules.dailyCap}`, `daily cap of ${rules.dailyCap}`)}</p>}
              </div>
            </div>
          </div>
          {rewardId && (
            <p className="mb-3 text-sm text-secondary">{tr("Se canjea", "Redeeming")} {rewards.find(item => item.id === rewardId)?.name} {tr("al confirmar.", "on confirm.")}</p>
          )}
          {error && <p role="alert" className="mb-3 text-sm text-danger">{error}</p>}
          <Button className="h-16 w-full text-lg" aria-label="Registrar visita y puntos" onClick={confirm} disabled={amount <= 0 && manual <= 0 && !rewardId}>
            {tr("Confirmar", "Confirm")} · +{points.awarded} pts
          </Button>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setRewardId(current => current ? null : affordable[0]?.id ?? null)} disabled={!affordable.length && !rewardId}>
              <Gift size={17} /> {rewardId ? tr("Quitar recompensa", "Remove reward") : affordable.length ? tr("Canjear recompensa", "Redeem reward") : tr("Sin puntos para canjear", "Not enough points")}
            </Button>
            <Button variant="secondary" onClick={reset}>{tr("Cancelar", "Cancel")}</Button>
          </div>
          {rewardId && affordable.length > 1 && (
            <select className="input mt-3" aria-label={tr("Recompensa a canjear", "Reward to redeem")} value={rewardId} onChange={event => setRewardId(event.target.value)}>
              {affordable.map(reward => <option key={reward.id} value={reward.id}>{reward.name} · {reward.points} pts</option>)}
            </select>
          )}
        </div>
      )}
      {step === "done" && customer && points && (
        <div role="dialog" aria-modal="true" aria-labelledby="visit-step-done" className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-brand px-6 text-center text-white dark:text-[#101513] motion-safe:animate-[fade-in_200ms_ease-out]">
          <span className="grid size-24 place-items-center rounded-full bg-white/15 motion-safe:animate-[pulse_700ms_ease-out_1]"><Check size={52} strokeWidth={2.5} /></span>
          <p className="metric-number mt-6 text-6xl">+{credited}</p>
          <p className="mt-1 text-lg opacity-80">{tr("puntos", "points")}</p>
          <h2 id="visit-step-done" tabIndex={-1} className="mt-6 text-2xl font-semibold outline-none">{tr("Visita registrada", "Visit recorded")}</h2>
          <p role="status" className="mt-2 opacity-85">
            {money(amount)} · {customer.name.split(" ")[0]} {tr("ahora tiene", "now has")} {customer.points.toLocaleString("es-PE")} {tr("puntos", "points")}
          </p>
          <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
            <button type="button" onClick={reset} className="h-16 rounded-control bg-white text-lg font-semibold text-brand hover:bg-white/90 dark:text-[#101513]">
              {tr("Escanear otro cliente", "Scan next customer")}
            </button>
            {lastVisit && (
              <button
                type="button"
                onClick={() => { operations.undoVisit(lastVisit.id); setLastVisit(null); reset(); }}
                className="flex h-12 items-center justify-center gap-2 rounded-control border border-white/40 font-medium hover:bg-white/10"
              >
                <Undo2 size={17} /> {tr("Deshacer registro", "Undo")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PointLine({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`mb-2 flex justify-between text-sm ${highlight ? "font-semibold text-brand" : ""}`}>
      <span className="flex items-center gap-1">{highlight && <Sparkles size={15} />}{label}</span>
      <strong>{value > 0 ? `+${value}` : value}</strong>
    </div>
  );
}
