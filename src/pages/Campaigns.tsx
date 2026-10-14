import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  MessageCircle,
  Plus,
  Send,
} from "lucide-react";
import { Badge, Button, Empty } from "../components/ui";
import { useOperations } from "../context/OperationsContext";
import { daysSince } from "../lib/analytics";
import { money } from "../lib/utils";

const steps = [
  "Objetivo",
  "Audiencia",
  "Oferta",
  "Mensaje",
  "Canal",
  "Programación",
];
export function Campaigns() {
  const { campaigns, customers, saveCampaign, saveAndSend, sendCampaign } = useOperations();
  const [builder, setBuilder] = useState(false);
  const inactive = customers.filter((customer) => daysSince(customer.lastVisit) >= 30).length;
  const add = () => {
    saveCampaign({
      id: `c${Date.now()}`,
      name: "Campaña de recuperación",
      channel: "WhatsApp",
      audience: "Inactivos 30 días",
      status: "Borrador",
      sent: 0,
      returned: 0,
      revenue: 0,
      message: "¡Te extrañamos! Regresa esta semana y recibe 100 puntos extra.",
    });
    setBuilder(false);
  };
  const sendNew = () => {
    saveAndSend({
      id: `c${Date.now()}`,
      name: "Campaña de recuperación",
      channel: "WhatsApp",
      audience: "Inactivos 30 días",
      status: "Borrador",
      sent: 0,
      returned: 0,
      revenue: 0,
      message: "¡Te extrañamos! Regresa esta semana y recibe 100 puntos extra.",
    });
    setBuilder(false);
  };
  if (builder)
    return <CampaignBuilder inactive={inactive} onClose={() => setBuilder(false)} onSave={add} onSend={sendNew} />;
  return (
    <div data-demo="campaign-builder" className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Crecimiento</p>
          <h1 className="page-title mt-1">Campañas</h1>
          <p className="mt-1.5 text-sm text-secondary">
            Activa clientes con mensajes relevantes y medibles.
          </p>
        </div>
        <Button onClick={() => setBuilder(true)}>
          <Plus size={16} />
          Nueva campaña
        </Button>
      </header>
      <section className="grid overflow-hidden rounded-panel border bg-surface sm:grid-cols-4">
        {[
          ["Activas", String(campaigns.filter((item) => item.status === "Enviada" || item.status === "Completada").length)],
          ["Programadas", String(campaigns.filter((item) => item.status === "Programada").length)],
          ["Conversión reciente", `${campaigns.reduce((sum, item) => sum + item.sent, 0) ? ((campaigns.reduce((sum, item) => sum + item.returned, 0) / campaigns.reduce((sum, item) => sum + item.sent, 0)) * 100).toFixed(1) : "0.0"}%`],
          ["Visitas atribuidas", String(campaigns.reduce((sum, item) => sum + item.returned, 0))],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`p-4 ${index ? "border-t sm:border-l sm:border-t-0" : ""}`}
          >
            <p className="text-xs text-secondary">{label}</p>
            <p className="metric-number mt-1 text-2xl">{value}</p>
          </div>
        ))}
      </section>
      <section className="overflow-hidden rounded-panel border bg-surface">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Todas las campañas</h2>
        </div>
        {campaigns.length === 0 ? (
          <Empty
            icon={<Send />}
            title="Aún no hay campañas"
            text={`Tienes ${inactive} clientes inactivos listos para una campaña de recuperación.`}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-subtle/60 text-xs text-secondary">
                  <tr>
                    {["Campaña", "Canal", "Audiencia", "Estado", "Regresaron", "Ventas"].map((x) => (
                      <th key={x} className="px-4 py-2.5 font-medium">
                        {x}
                      </th>
                    ))}
                    <th className="px-4 py-2.5"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-t hover:bg-subtle/50">
                      <td className="px-4 py-3 font-medium">{campaign.name}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <ChannelIcon channel={campaign.channel} />
                          {campaign.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-secondary">{campaign.audience}</td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(campaign.status)}>{campaign.status}</Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{campaign.returned}</td>
                      <td className="px-4 py-3 tabular-nums">{money(campaign.revenue)}</td>
                      <td className="px-4 py-3 text-right">
                        {canSend(campaign.status) && (
                          <Button className="min-h-9 px-3 text-xs" onClick={() => sendCampaign(campaign.id)}>Enviar</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y md:hidden">
              {campaigns.map((campaign) => (
                <li key={campaign.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{campaign.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-secondary">
                        <ChannelIcon channel={campaign.channel} /> {campaign.channel} · {campaign.audience}
                      </p>
                    </div>
                    <Badge tone={statusTone(campaign.status)}>{campaign.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-secondary">
                      <strong className="text-primary tabular-nums">{campaign.returned}</strong> regresaron ·{" "}
                      <strong className="text-primary tabular-nums">{money(campaign.revenue)}</strong>
                    </p>
                    {canSend(campaign.status) && (
                      <Button className="min-h-9 px-3 text-xs" onClick={() => sendCampaign(campaign.id)}>Enviar</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
function statusTone(status: string) {
  return status === "Completada" ? "success" : status === "Programada" ? "warning" : "neutral";
}

function canSend(status: string) {
  return status === "Borrador" || status === "Programada";
}

function ChannelIcon({ channel }: { channel: string }) {
  return channel === "WhatsApp" ? <MessageCircle size={14} /> : <Mail size={14} />;
}

function CampaignBuilder({
  inactive,
  onClose,
  onSave,
  onSend,
}: {
  inactive: number;
  onClose: () => void;
  onSave: () => void;
  onSend: () => void;
}) {
  const [step, setStep] = useState(0);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <header className="mb-5 flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          aria-label="Volver a campañas"
        >
          <ArrowLeft size={17} />
        </Button>
        <div>
          <p className="eyebrow">Nueva campaña</p>
          <h1 className="page-title mt-1">Campaña de recuperación</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="secondary" onClick={onSend}>
            <Send size={16} />
            Enviar por WhatsApp
          </Button>
          <Button type="submit">
            Guardar borrador
          </Button>
        </div>
      </header>
      <div className="grid min-h-[600px] overflow-hidden rounded-feature border bg-surface lg:grid-cols-[180px_1fr_320px]">
        <nav
          className="border-b bg-subtle/40 p-3 lg:border-b-0 lg:border-r"
          aria-label="Pasos de campaña"
        >
          {steps.map((label, index) => (
            <button
              type="button"
              key={label}
              onClick={() => setStep(index)}
              className={`flex w-full items-center gap-2 rounded-control px-3 py-2.5 text-left text-sm ${step === index ? "bg-surface font-medium shadow-sm" : "text-secondary"}`}
            >
              <span
                className={`grid size-5 place-items-center rounded-full text-[10px] ${index < step ? "bg-success text-white" : "border"}`}
              >
                {index < step ? <Check size={12} /> : index + 1}
              </span>
              {label}
            </button>
          ))}
        </nav>
        <main className="p-5 md:p-8">
          <p className="eyebrow">Paso {step + 1} de 6</p>
          <StepContent step={step} inactive={inactive} />
          <div className="mt-8 flex justify-between border-t pt-5">
            <Button
              type="button"
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((value) => value - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              disabled={step === 5}
              onClick={() => setStep((value) => value + 1)}
            >
              Continuar
              <ArrowRight size={15} />
            </Button>
          </div>
        </main>
        <aside className="border-t bg-subtle/30 p-5 lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
            Vista previa
          </p>
          <div className="mt-4 rounded-feature bg-[#e5eee9] p-3">
            <div className="ml-auto max-w-[92%] rounded-panel bg-white p-3 text-sm text-[#18201d] shadow-sm">
              ¡Te extrañamos! Regresa esta semana y recibe 100 puntos extra.
              <span className="mt-2 block text-right text-[10px] text-[#64706a]">
                4:30 p. m. ✓✓
              </span>
            </div>
          </div>
          <div className="mt-5 border-l-2 border-brand pl-3">
            <p className="text-xs font-semibold">Sugerencia</p>
            <p className="mt-1 text-xs leading-5 text-secondary">
              Tus clientes suelen interactuar mejor los jueves por la tarde.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
function StepContent({ step, inactive }: { step: number; inactive: number }) {
  const content = [
    <>
      <h2 className="mt-2 text-xl font-semibold">¿Qué quieres lograr?</h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {[
          "Recuperar clientes",
          "Aumentar visitas",
          "Promocionar algo",
          "Premiar clientes",
          "Conseguir referidos",
        ].map((x, index) => (
          <label
            key={x}
            className={`flex min-h-14 items-center gap-3 rounded-panel border p-3 ${index === 0 ? "border-brand bg-brand-subtle" : ""}`}
          >
            <input type="radio" name="goal" defaultChecked={index === 0} />
            <span className="text-sm font-medium">{x}</span>
          </label>
        ))}
      </div>
    </>,
    <>
      <h2 className="mt-2 text-xl font-semibold">Elige tu audiencia</h2>
      <div data-demo="campaign-audience" className="mt-5 rounded-panel border border-brand bg-brand-subtle p-4">
        <p className="text-sm font-medium">
          Sugerido: {inactive} clientes inactivos por 30+ días
        </p>
        <p className="mt-1 text-xs text-secondary">
          Alta probabilidad de responder a un incentivo de regreso.
        </p>
      </div>
    </>,
    <>
      <h2 className="mt-2 text-xl font-semibold">Define una oferta</h2>
      <select className="input mt-5">
        <option>100 puntos extra</option>
        <option>10% de descuento</option>
        <option>Bebida de cortesía</option>
      </select>
    </>,
    <>
      <h2 className="mt-2 text-xl font-semibold">Escribe el mensaje</h2>
      <textarea
        className="input mt-5 min-h-36"
        defaultValue="¡Te extrañamos! Regresa esta semana y recibe 100 puntos extra."
      />
      <p className="mt-2 text-xs text-secondary">
        Mensaje sugerido según campañas con mejor retorno.
      </p>
    </>,
    <>
      <h2 className="mt-2 text-xl font-semibold">Selecciona el canal</h2>
      <div className="mt-5 grid gap-2">
        <label className="rounded-panel border border-brand bg-brand-subtle p-4">
          <input type="radio" name="channel" defaultChecked /> WhatsApp
        </label>
        <label className="rounded-panel border p-4">
          <input type="radio" name="channel" /> Correo electrónico
        </label>
      </div>
    </>,
    <>
      <h2 className="mt-2 text-xl font-semibold">Programa el envío</h2>
      <input className="input mt-5" type="datetime-local" />
      <p className="mt-3 text-sm text-secondary">
        Recomendado: jueves, 4:30 p. m.
      </p>
    </>,
  ][step];
  return <div>{content}</div>;
}
