import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import {
  CalendarClock,
  Check,
  Copy,
  Gift,
  Home,
  LogOut,
  MessageCircle,
  QrCode,
  Share2,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Badge, Button, Card, Progress } from "../components/ui";
import { useApp } from "../context/AppContext";
import { useOperations } from "../context/OperationsContext";
import { daysSince, hexToChannels, nextTier, purchaseForReward, relativeTime, usablePoints } from "../lib/analytics";
import { tierLabel } from "../lib/i18n";
import { findCustomer, type BusinessSettings, type StoredCustomer } from "../lib/operations";
import { useTr } from "../lib/useTr";
import { rewards } from "../data/mock";

type Tab = "home" | "qr" | "rewards" | "refer" | "profile";

export function CustomerPortal() {
  const operations = useOperations();
  const { theme } = useApp();
  const tr = useTr();
  const [tab, setTab] = useState<Tab>("home");
  const [portalId, setPortalId] = useState(() => sessionStorage.getItem("loopia-portal-customer") || "CUS-0002");
  const [ref] = useState(() => new URLSearchParams(window.location.search).get("ref"));
  const customer = operations.customers.find(item => item.id === portalId) ?? operations.customers.find(item => item.id === "CUS-0002") ?? operations.customers[0];
  const { settings } = operations;
  const balance = usablePoints(customer, settings.rules.expirationDays);
  const open = (next: StoredCustomer) => {
    sessionStorage.setItem("loopia-portal-customer", next.id);
    setPortalId(next.id);
  };
  useEffect(() => {
    if (tab === "qr") sessionStorage.setItem("loopia-scan-code", customer.id);
  }, [tab, customer.id]);
  const referralMessage = tr(
    `Te invito a ${settings.visibleName}: recibe ${settings.referralFriendPoints} puntos de bienvenida con mi enlace.`,
    `Join me at ${settings.visibleName}: get ${settings.referralFriendPoints} welcome points with my link.`,
  );
  const referralLink = `${window.location.origin}/portal?ref=${customer.id}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${referralMessage} ${referralLink}`)}`;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-24 shadow-overlay" style={brandStyle(settings, theme)}>
      <header data-demo="portal-hero" className="relative overflow-hidden px-5 pb-16 pt-6 text-white" style={{ backgroundColor: settings.primaryColor }}>
        <div className="absolute -right-16 -top-16 size-52 rounded-full border" style={{ borderColor: `${settings.accentColor}33` }} />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em]" style={{ color: settings.accentColor }}>
              {settings.visibleName}
            </p>
            <p className="mt-1 text-xs text-white/70">
              {tr("Parte de", "Part of")} {settings.businessName.replace(" Demo", "")}
            </p>
          </div>
          {settings.logo
            ? <img src={settings.logo} alt={settings.visibleName} className="size-11 rounded-full bg-white object-cover ring-2 ring-white/30" />
            : <span className="grid size-11 place-items-center rounded-full bg-white/10 font-bold">{customer.initials}</span>}
        </div>
        {tab === "home" && (
          <div className="relative mt-9">
            <p className="text-sm text-white/70">{tr("Hola", "Hi")}, {customer.name.split(" ")[0]}</p>
            <h1 className="mt-1 text-3xl font-bold">{settings.welcome}</h1>
          </div>
        )}
      </header>
      <main className="relative -mt-10 px-4" aria-live="polite">
        {ref && ref !== customer.id && <ReferralJoin referrerId={ref} onCreate={input => { const result = operations.createCustomer(input); if (result.ok) open(result.customer); return result.ok; }} />}
        {tab === "home" && (
          <HomeTab
            customer={customer}
            balance={balance}
            settings={settings}
            whatsapp={whatsapp}
            visits={operations.visits.filter(visit => visit.customerId === customer.id)}
            onQR={() => setTab("qr")}
            onRefer={() => setTab("refer")}
          />
        )}
        {tab === "qr" && <QRTab customer={customer} />}
        {tab === "rewards" && <RewardsTab customer={customer} balance={balance} onRedeem={reward => operations.redeemReward(customer.id, reward, customer.name, settings.visibleName)} />}
        {tab === "refer" && <ReferTab link={referralLink} message={referralMessage} whatsapp={whatsapp} friendPoints={settings.referralFriendPoints} referrerPoints={settings.referralReferrerPoints} />}
        {tab === "profile" && <ProfileTab customer={customer} onSave={patch => operations.updateCustomer(customer.id, patch)} onLogout={() => { sessionStorage.removeItem("loopia-portal-customer"); const fallback = operations.customers.find(item => item.name === "Sofía Mendoza") ?? operations.customers[0]; open(fallback); setTab("home"); }} onIdentify={query => { const match = findCustomer(operations.customers, query); if (!match) return false; open(match); return true; }} />}
      </main>
      <nav
        data-demo="portal-navigation"
        className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-md grid-cols-5 border-t bg-surface/95 p-2 backdrop-blur"
        aria-label={tr("Portal del cliente", "Customer portal")}
      >
        {(
          [
            ["home", tr("Inicio", "Home"), Home],
            ["rewards", tr("Recompensas", "Rewards"), Gift],
            ["qr", "QR", QrCode],
            ["refer", tr("Invitar", "Invite"), Users],
            ["profile", tr("Perfil", "Profile"), User],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-control p-2 text-[10px] font-semibold ${tab === id ? "bg-brand-subtle text-primary" : "text-secondary"}`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function mix(hex: string, target: [number, number, number], ratio: number) {
  const channels = hexToChannels(hex);
  if (!channels) return null;
  return channels.split(" ").map((value, index) => Math.round(Number(value) * (1 - ratio) + target[index] * ratio)).join(" ");
}

function brandStyle(settings: BusinessSettings, theme: "light" | "dark") {
  const base = theme === "dark" ? settings.accentColor : settings.primaryColor;
  const brand = hexToChannels(base);
  if (!brand) return undefined;
  const style: Record<string, string> = {
    "--brand": brand,
    "--brand-hover": mix(base, theme === "dark" ? [255, 255, 255] : [0, 0, 0], 0.15) ?? brand,
    "--brand-subtle": mix(base, theme === "dark" ? [24, 27, 25] : [255, 255, 255], theme === "dark" ? 0.8 : 0.88) ?? brand,
  };
  return style as CSSProperties;
}

function HomeTab({ customer, balance, settings, whatsapp, visits, onQR, onRefer }: { customer: StoredCustomer; balance: number; settings: BusinessSettings; whatsapp: string; visits: { id: string; at: string; location: string; points: number; rewardName: string | null }[]; onQR: () => void; onRefer: () => void }) {
  const { language } = useApp();
  const tr = useTr();
  const tier = nextTier(balance);
  const topTier = tier.remaining <= 0;
  const nextReward = rewards.find(reward => reward.points > balance) ?? rewards[rewards.length - 1];
  const gap = Math.max(0, nextReward.points - balance);
  const purchase = purchaseForReward(gap, settings.rules);
  const now = new Date();
  const monthVisits = visits.filter(visit => new Date(visit.at).getMonth() === now.getMonth() && visit.points >= 0).length;
  const challenge = Math.min(100, Math.round((Math.min(monthVisits, 3) / 3) * 100));
  const remaining = Math.max(0, 3 - monthVisits);
  const month = now.toLocaleString(language === "en" ? "en-US" : "es-PE", { month: "long" });
  const sinceLast = visits[0] ? daysSince(visits[0].at) : daysSince(customer.lastVisit);
  const lastLabel = sinceLast === 0 ? tr("Viniste hoy", "You visited today") : sinceLast === 1 ? tr("Tu última visita fue ayer", "Your last visit was yesterday") : tr(`Han pasado ${sinceLast} días desde tu última visita`, `${sinceLast} days since your last visit`);
  return (
    <div className="space-y-4">
      <Card data-demo="portal-progress" className="relative overflow-hidden border-0 text-white" style={{ backgroundColor: settings.primaryColor }}>
        <svg
          className="pointer-events-none absolute -right-5 -top-8 size-36 -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={settings.accentColor}
            strokeWidth="2"
            strokeDasharray="90 180"
            className="motion-safe:animate-[loop-complete_1.2s_ease-out_1]"
          />
        </svg>
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/75">
              {tr("Puntos", "Points")}
            </p>
            <p className="metric-number mt-1 text-5xl">{balance.toLocaleString("es-PE")}</p>
            <p className="mt-2 text-xs text-white/75">
              {topTier
                ? tr("Nivel máximo alcanzado", "Top tier reached")
                : `${tr("de", "of")} ${tier.min.toLocaleString("es-PE")} ${tr("para", "for")} ${tierLabel(language, tier.name)}`}
            </p>
          </div>
          <Badge tone="gold">{tierLabel(language, customer.tier)}</Badge>
        </div>
        {!topTier && (
          <div className="relative mt-6">
            <div className="mb-2 flex justify-between text-xs text-white/80">
              <span>{tr(`${tier.remaining.toLocaleString("es-PE")} puntos para ${tierLabel(language, tier.name)}`, `${tier.remaining.toLocaleString("es-PE")} points to ${tierLabel(language, tier.name)}`)}</span>
              <span>{tier.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label={tr("Progreso al siguiente nivel", "Progress to next tier")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={tier.progress}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, tier.progress)}%`, backgroundColor: settings.accentColor }} />
            </div>
          </div>
        )}
        <Button onClick={onQR} className="relative mt-5 w-full bg-white text-ink hover:bg-stone-100">
          <QrCode size={17} /> {tr("Mostrar mi QR", "Show my QR")}
        </Button>
      </Card>
      <Card data-demo="portal-reward" className="border-gold/40">
        <div className="flex gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#f4e4ca] text-[#7a4c12] dark:bg-gold/20 dark:text-[#f1c98d]">
            <Gift />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-clay">
              {tr("Próxima recompensa", "Next reward")}
            </p>
            <h2 className="mt-1 font-bold">{nextReward.name}</h2>
            <p className="mt-1 text-sm">
              {gap === 0
                ? tr("Ya puedes canjearla", "You can redeem it now")
                : purchase === 0
                  ? tr("Tu próxima visita te la da", "Your next visit unlocks it")
                  : tr(`Una compra de S/ ${purchase} más te la da`, `S/ ${purchase} more in purchases unlocks it`)}
            </p>
            {gap > 0 && <p className="mt-0.5 text-xs text-muted">{tr(`Te faltan ${gap.toLocaleString("es-PE")} puntos`, `${gap.toLocaleString("es-PE")} points to go`)}</p>}
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 border-t pt-3 text-xs text-muted">
          <CalendarClock size={14} /> {lastLabel}
        </p>
      </Card>
      <Card>
        <div className="flex justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-clay">
              {tr(`Desafío de ${month}`, `${month[0].toUpperCase()}${month.slice(1)} challenge`)}
            </p>
            <h2 className="mt-1 text-lg font-bold">{tr("Visita 3 veces este mes", "Visit 3 times this month")}</h2>
          </div>
          <span className="grid size-11 place-items-center rounded-xl bg-orange-100 text-[#884025]">
            <Star />
          </span>
        </div>
        <div className="mt-5">
          <Progress
            value={challenge}
            label={tr(`${Math.min(monthVisits, 3)} de 3 visitas · recompensa: 250 puntos`, `${Math.min(monthVisits, 3)} of 3 visits · reward: 250 points`)}
          />
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-success">
          <Sparkles size={16} />
          {remaining
            ? tr(`${remaining === 1 ? "Una visita más" : `${remaining} visitas más`} para completarlo`, `${remaining === 1 ? "One more visit" : `${remaining} more visits`} to complete it`)
            : tr("Desafío completo este mes", "Challenge complete this month")}
        </p>
      </Card>
      <div data-demo="portal-referral" className="rounded-2xl bg-[#ead9bd] p-5 text-ink shadow-soft">
        <Share2 className="text-[#82452f]" />
        <h2 className="mt-3 font-bold">{tr("Invita a un amigo", "Invite a friend")}</h2>
        <p className="mt-1 text-sm text-stone-700">
          {tr(
            `Tu amigo recibe ${settings.referralFriendPoints} puntos. Tú recibes ${settings.referralReferrerPoints} cuando complete su primera visita.`,
            `Your friend gets ${settings.referralFriendPoints} points. You get ${settings.referralReferrerPoints} after their first visit.`,
          )}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={whatsapp} target="_blank" rel="noreferrer" className="btn bg-[#25D366] text-sm text-[#0b2e17] hover:bg-[#1fbe5a]">
            <MessageCircle size={16} /> WhatsApp
          </a>
          <button type="button" onClick={onRefer} className="btn bg-white/70 text-sm hover:bg-white">
            {tr("Más opciones", "More options")}
          </button>
        </div>
      </div>
      <Card>
        <h2 className="font-bold">{tr("Actividad reciente", "Recent activity")}</h2>
        {visits.length ? (
          <div className="mt-3 divide-y">
            {visits.slice(0, 4).map(visit => (
              <div className="flex gap-3 py-3" key={visit.id}>
                <span className="text-xs text-muted">{relativeTime(visit.at, language)}</span>
                <p className="flex-1 text-sm font-medium">{visit.rewardName ?? tr(`Visita en ${visit.location}`, `Visit at ${visit.location}`)}</p>
                <strong className="text-xs text-clay">{visit.points > 0 ? "+" : ""}{visit.points} pts</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">{tr("Aún no hay movimientos. Muestra tu QR en tu próxima visita.", "No activity yet. Show your QR on your next visit.")}</p>
        )}
      </Card>
    </div>
  );
}

function QRTab({ customer }: { customer: StoredCustomer }) {
  const tr = useTr();
  return (
    <Card className="text-center">
      <p className="eyebrow">{tr("Tu identificación", "Your ID")}</p>
      <h1 className="mt-2 text-2xl font-bold">{tr("Mi código QR", "My QR code")}</h1>
      <p className="mt-2 text-sm text-muted">
        {tr("Muéstralo al personal en cada visita para sumar puntos o canjear.", "Show it to staff on every visit to earn or redeem points.")}
      </p>
      <div className="mx-auto mt-7 w-fit rounded-2xl border bg-white p-5">
        <QRCodeSVG value={`LOOPIA:${customer.id}`} size={220} level="H" />
      </div>
      <p className="mt-5 font-mono font-bold">{customer.id}</p>
      <p className="sr-only">{tr("Código personal de", "Personal code for")} {customer.name}, {customer.id}</p>
      <div className="mt-6 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-900 dark:bg-green-900/20 dark:text-green-100">
        <Check className="mr-2 inline" size={17} />
        {tr("Listo para escanear", "Ready to scan")}
      </div>
    </Card>
  );
}

function RewardsTab({ customer, balance, onRedeem }: { customer: StoredCustomer; balance: number; onRedeem: (reward: { id: string; name: string; points: number }) => { ok: boolean } }) {
  const tr = useTr();
  const [message, setMessage] = useState("");
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-white">{tr("Tus recompensas", "Your rewards")}</h1>
      {message && <p role="status" className="mb-3 text-sm font-semibold text-white">{message}</p>}
      <div className="space-y-3">
        {rewards.filter(reward => !reward.tier || reward.tier === customer.tier || tierRank(customer.tier) >= tierRank(reward.tier)).map((reward) => (
          <Card key={reward.id}>
            <div className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand text-white dark:text-[#101513]">
                <Gift />
              </span>
              <div className="flex-1">
                <p className="font-bold">{reward.name}</p>
                <p className="text-xs text-muted">{reward.description}</p>
                <p className="mt-2 text-sm font-bold text-clay">
                  {reward.points} {tr("puntos", "points")}
                </p>
              </div>
            </div>
            <Button className="mt-4 w-full" disabled={reward.points > balance} onClick={() => setMessage(onRedeem(reward).ok ? tr(`Canjeaste ${reward.name}. Muéstralo en caja.`, `You redeemed ${reward.name}. Show it at the counter.`) : tr("No tienes puntos suficientes.", "You don't have enough points."))}>
              {reward.points > balance
                ? tr(`Te faltan ${reward.points - balance} puntos`, `${reward.points - balance} points to go`)
                : tr("Canjear recompensa", "Redeem reward")}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function tierRank(tier: StoredCustomer["tier"]) {
  return ["Explorador", "Viajero", "Frecuente", "Insider", "VIP"].indexOf(tier);
}

function ReferTab({ link, message, whatsapp, friendPoints, referrerPoints }: { link: string; message: string; whatsapp: string; friendPoints: number; referrerPoints: number }) {
  const tr = useTr();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(link);
    setCopied(true);
  };
  const share = async () => {
    if (navigator.share) await navigator.share({ title: "Loopia", text: message, url: link });
    else await copy();
  };
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-white">{tr("Invita a un amigo", "Invite a friend")}</h1>
      <Card className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#f4e4ca] text-[#7a4c12]">
          <Users />
        </span>
        <h2 className="mt-4 text-xl font-bold">{tr("Compartir sabe mejor", "Sharing tastes better")}</h2>
        <p className="mt-2 text-sm text-muted">
          {tr("Tu recomendación conecta a un amigo con una buena experiencia.", "Your recommendation connects a friend with a great experience.")}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl bg-cream p-4 dark:bg-white/5">
            <p className="text-xs text-muted">{tr("Tu amigo recibe", "Your friend gets")}</p>
            <strong className="mt-1 block">{friendPoints} {tr("puntos", "points")}</strong>
            <p className="text-xs text-muted">{tr("de bienvenida", "as a welcome")}</p>
          </div>
          <div className="rounded-xl bg-cream p-4 dark:bg-white/5">
            <p className="text-xs text-muted">{tr("Tú recibes", "You get")}</p>
            <strong className="mt-1 block">{referrerPoints} {tr("puntos", "points")}</strong>
            <p className="text-xs text-muted">{tr("en su primera visita", "on their first visit")}</p>
          </div>
        </div>
        <a href={whatsapp} target="_blank" rel="noreferrer" className="btn mt-6 h-12 w-full bg-[#25D366] text-[#0b2e17] hover:bg-[#1fbe5a]">
          <MessageCircle size={18} /> {tr("Enviar por WhatsApp", "Send on WhatsApp")}
        </a>
        <div className="mx-auto mt-6 w-fit rounded-xl border bg-white p-3">
          <QRCodeSVG value={link} size={140} />
        </div>
        <div className="mt-5 flex rounded-xl bg-cream p-2 dark:bg-white/5">
          <code className="min-w-0 flex-1 truncate p-2 text-left text-xs">
            {link.replace(/^https?:\/\//, "")}
          </code>
          <button onClick={() => void copy()} className="rounded-lg p-2" aria-label={tr("Copiar enlace", "Copy link")}>
            <Copy size={17} />
          </button>
        </div>
        {copied && (
          <p role="status" className="mt-2 text-sm font-semibold text-success">
            {tr("Enlace copiado", "Link copied")}
          </p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => void share()}>
            <Share2 size={17} /> {tr("Compartir", "Share")}
          </Button>
          <Button variant="secondary" onClick={() => void copy()}>
            <Copy size={17} /> {tr("Copiar enlace", "Copy link")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ProfileTab({ customer, onSave, onLogout, onIdentify }: { customer: StoredCustomer; onSave: (patch: { name: string; birthday?: string; language: "ES" | "EN" }) => void; onLogout: () => void; onIdentify: (query: string) => boolean }) {
  const { setLanguage: setAppLanguage } = useApp();
  const tr = useTr();
  const [name, setName] = useState(customer.name);
  const [birthday, setBirthday] = useState(customer.birthday ?? "");
  const [language, setLanguage] = useState<"ES" | "EN">(customer.language);
  useEffect(() => {
    setName(customer.name);
    setBirthday(customer.birthday ?? "");
    setLanguage(customer.language);
  }, [customer]);
  const [lookup, setLookup] = useState("");
  const [saved, setSaved] = useState(false);
  const [missing, setMissing] = useState(false);
  const dirty = name !== customer.name || birthday !== (customer.birthday ?? "") || language !== customer.language;
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-white">{tr("Mi perfil", "My profile")}</h1>
      <Card className="space-y-4">
        <form className="space-y-4" onSubmit={event => { event.preventDefault(); const found = onIdentify(lookup); setMissing(!found); }}>
          <label>
            <span className="label">{tr("Abrir otra tarjeta", "Open another card")}</span>
            <input className="input" value={lookup} placeholder={tr("Código o teléfono", "Code or phone")} onChange={event => setLookup(event.target.value)} />
          </label>
          <Button type="submit" variant="secondary" className="w-full">{tr("Buscar mi cuenta", "Find my account")}</Button>
          {missing && <p role="alert" className="text-sm text-danger">{tr("No encontramos esa tarjeta.", "We couldn't find that card.")}</p>}
        </form>
        <label>
          <span className="label">{tr("Nombre", "Name")}</span>
          <input className="input" value={name} onChange={event => { setName(event.target.value); setSaved(false); }} />
        </label>
        <label>
          <span className="label">{tr("Teléfono verificado", "Verified phone")}</span>
          <input className="input" value={customer.phone} disabled />
        </label>
        <label>
          <span className="label">{tr("Cumpleaños", "Birthday")}</span>
          <input className="input" type="date" value={birthday} onChange={event => { setBirthday(event.target.value); setSaved(false); }} />
        </label>
        <label>
          <span className="label">{tr("Idioma preferido", "Preferred language")}</span>
          <select className="input" value={language} onChange={event => { setLanguage(event.target.value as "ES" | "EN"); setSaved(false); }}>
            <option value="ES">Español</option>
            <option value="EN">English</option>
          </select>
        </label>
        <Button className="w-full" disabled={!dirty} onClick={() => { onSave({ name, birthday, language }); setAppLanguage(language === "EN" ? "en" : "es"); setSaved(true); }}>
          {dirty ? tr("Guardar cambios", "Save changes") : tr("Sin cambios", "No changes")}
        </Button>
        {saved && <p role="status" className="text-sm font-semibold text-success">{tr("Perfil actualizado", "Profile updated")}</p>}
        <Button variant="ghost" className="w-full text-danger" onClick={onLogout}>
          <LogOut size={17} /> {tr("Cerrar sesión", "Log out")}
        </Button>
      </Card>
    </div>
  );
}

function ReferralJoin({ referrerId, onCreate }: { referrerId: string; onCreate: (input: { name: string; phone: string; referrerId: string }) => boolean }) {
  const tr = useTr();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const ok = onCreate({ name: String(data.get("name") || ""), phone: String(data.get("phone") || ""), referrerId });
    if (!ok) setError(tr("Ese teléfono ya tiene una tarjeta. Ábrela desde tu perfil.", "That phone already has a card. Open it from your profile."));
    else setDone(true);
  };
  if (done) return <Card className="mb-4"><p className="text-sm font-semibold">{tr("Tu tarjeta ya tiene los puntos de bienvenida.", "Your card already has the welcome points.")}</p></Card>;
  return (
    <Card className="mb-4">
      <h2 className="font-bold">{tr("Te invitaron a Loopia", "You were invited to Loopia")}</h2>
      <p className="mt-1 text-sm text-muted">{tr("Crea tu tarjeta para recibir los puntos de bienvenida.", "Create your card to get the welcome points.")}</p>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <input className="input" name="name" required placeholder={tr("Tu nombre", "Your name")} aria-label={tr("Tu nombre", "Your name")} />
        <input className="input" name="phone" required placeholder={tr("Tu teléfono", "Your phone")} aria-label={tr("Tu teléfono", "Your phone")} />
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full">{tr("Crear mi tarjeta", "Create my card")}</Button>
      </form>
    </Card>
  );
}
