import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button } from "../components/ui";
import { useOperations } from "../context/OperationsContext";
import type { AutomationRule } from "../lib/operations";

const triggers: { value: AutomationRule["when"]; label: string }[] = [
  { value: "signup", label: "Cliente nuevo se registra" },
  { value: "inactive-30", label: "Cliente no visita durante 30 días" },
  { value: "birthday", label: "Cumpleaños del cliente" },
  { value: "tier", label: "Nivel de fidelidad alcanzado" },
];

export function Automations() {
  const { automations, toggleAutomation, addAutomation, runBirthdays } = useOperations();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [when, setWhen] = useState<AutomationRule["when"]>("signup");
  const [then, setThen] = useState("Enviar WhatsApp");
  const [notice, setNotice] = useState("");
  const save = () => {
    if (!name.trim()) return;
    addAutomation({ name: name.trim(), when, then: then.trim() || "Enviar WhatsApp", active: true });
    setName("");
    setCreating(false);
  };
  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Automatizaciones</h1>
          <p className="mt-1 text-sm text-secondary">Reglas simples: cuando ocurre algo, Loopia actúa por ti.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setNotice(runBirthdays() ? "Beneficio de cumpleaños acreditado." : "Nadie cumple años hoy, o la regla está pausada.")}>Revisar cumpleaños</Button>
          <Button onClick={() => setCreating(value => !value)}><Plus size={16} /> Nueva automatización</Button>
        </div>
      </header>
      {notice && <p role="status" className="text-sm text-secondary">{notice}</p>}
      {creating && (
        <form className="grid gap-3 rounded-panel border bg-surface p-4 md:grid-cols-4" onSubmit={event => { event.preventDefault(); save(); }}>
          <label>
            <span className="label">Nombre</span>
            <input className="input" value={name} onChange={event => setName(event.target.value)} required />
          </label>
          <label>
            <span className="label">Cuando</span>
            <select className="input" value={when} onChange={event => setWhen(event.target.value as AutomationRule["when"])}>
              {triggers.map(trigger => <option key={trigger.value} value={trigger.value}>{trigger.label}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Entonces</span>
            <input className="input" value={then} onChange={event => setThen(event.target.value)} />
          </label>
          <Button type="submit" className="self-end">Guardar regla</Button>
        </form>
      )}
      <div className="space-y-3">
        {automations.map(item => (
          <article key={item.id} className="rounded-panel border bg-surface p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{item.name}</h2>
                <Badge tone={item.active ? "success" : "neutral"}>{item.active ? "Activa" : "Pausada"}</Badge>
              </div>
              <button type="button" role="switch" aria-checked={item.active} aria-label={`${item.active ? "Pausar" : "Activar"} ${item.name}`} onClick={() => toggleAutomation(item.id)} className={`relative h-7 w-12 rounded-full transition-colors ${item.active ? "bg-brand" : "bg-subtle"}`}>
                <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${item.active ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-control bg-subtle/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Cuando</p>
                <p className="mt-1 text-sm font-medium">{triggers.find(trigger => trigger.value === item.when)?.label ?? item.when}</p>
              </div>
              <span className="hidden text-xs font-semibold text-tertiary md:block" aria-hidden>→</span>
              <div className="rounded-control bg-subtle/70 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Entonces</p>
                <p className="mt-1 text-sm font-medium">{item.then}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-secondary">{item.triggered} activaciones · {item.returned} regresaron</p>
          </article>
        ))}
      </div>
    </div>
  );
}
