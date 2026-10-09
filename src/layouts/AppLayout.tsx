import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Gift,
  Handshake,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PlayCircle,
  QrCode,
  RotateCcw,
  Search,
  Settings,
  Star,
  Sun,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { Logo } from "../components/Logo";
import { Badge } from "../components/ui";
import { CommandPalette } from "../components/CommandPalette";
import { DemoTour } from "../components/DemoTour";
import { useApp } from "../context/AppContext";
import { t, type CopyKey } from "../lib/i18n";
import { isDemoMode } from "../config/runtime";
import { cn } from "../lib/utils";
import { demoScenarios, type DemoScenario } from "../data/scenarios";

type NavItem = [string, CopyKey, typeof LayoutDashboard];
const groups: { label: string; items: NavItem[] }[] = [
  { label: "General", items: [["/app", "dashboard", LayoutDashboard]] },
  {
    label: "Clientes",
    items: [
      ["/app/customers", "customers", Users],
      ["/app/visits", "visits", QrCode],
      ["/app/referrals", "referrals", UserRound],
    ],
  },
  {
    label: "Crecimiento",
    items: [
      ["/app/loyalty", "loyalty", Star],
      ["/app/rewards", "rewards", Gift],
      ["/app/campaigns", "campaigns", WalletCards],
      ["/app/automations", "automations", Zap],
    ],
  },
  { label: "Análisis", items: [["/app/reports", "reports", BarChart3]] },
  {
    label: "Negocio",
    items: [
      ["/app/partners", "partners", Handshake],
      ["/app/locations", "locations", Building2],
      ["/app/team", "team", Users],
      ["/app/qr", "qr", QrCode],
    ],
  },
];

export function AppLayout() {
  const app = useApp();
  if (app.user?.role === "staff") return <StaffShell />;
  return <AdminShell />;
}

function AdminShell() {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    user,
    logout,
    scenario,
    setScenario,
    resetDemo,
    setDemoRole,
  } = useApp();
  const navigate = useNavigate(),
    location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false),
    [collapsed, setCollapsed] = useState(
      () => localStorage.getItem("loopia-sidebar") === "collapsed",
    ),
    [commands, setCommands] = useState(false),
    [tour, setTour] = useState(false);
  const drawer = useRef<HTMLElement>(null),
    previous = useRef<HTMLElement | null>(null);
  useEffect(
    () => document.getElementById("main-content")?.focus(),
    [location.pathname],
  );
  useEffect(() => {
    localStorage.setItem(
      "loopia-sidebar",
      collapsed ? "collapsed" : "expanded",
    );
  }, [collapsed]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommands(true);
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    previous.current = document.activeElement as HTMLElement;
    const panel = drawer.current;
    panel?.querySelector<HTMLElement>("button,a[href]")?.focus();
    document.getElementById("app-frame")?.setAttribute("inert", "");
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key === "Tab" && panel) {
        const items = [
          ...panel.querySelectorAll<HTMLElement>(
            "button:not([disabled]),a[href],select:not([disabled])",
          ),
        ];
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.getElementById("app-frame")?.removeAttribute("inert");
      document.removeEventListener("keydown", key);
      previous.current?.focus();
    };
  }, [mobileOpen]);
  const signOut = () => {
    logout();
    navigate("/login");
  };
  const roleChange = (value: string) => {
    if (value === "customer") navigate("/portal");
    else {
      setDemoRole(value as "owner" | "staff");
      if (value === "staff") navigate("/app/visits");
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[70] -translate-y-20 rounded-control bg-surface px-4 py-2 font-semibold shadow-overlay focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-[rgb(var(--overlay))] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        ref={drawer}
        id="app-navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-surface transition-[width,transform] duration-200 motion-reduce:transition-none lg:visible lg:translate-x-0",
          collapsed ? "w-16" : "w-[232px]",
          mobileOpen ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
        aria-label="Navegación principal"
      >
        <div
          className={cn(
            "flex h-16 items-center border-b",
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          <Logo compact={collapsed} />
          <button
            onClick={() => setMobileOpen(false)}
            className="grid size-11 place-items-center rounded-control lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>
        {!collapsed && (
          <button className="mx-3 mt-3 flex items-center gap-3 rounded-control border p-2 text-left hover:bg-subtle">
            <span className="grid size-8 place-items-center rounded-control bg-brand text-xs font-semibold text-white">
              AH
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm font-semibold">
                {demoScenarios[scenario].organization.replace(" Demo", "")}
              </strong>
              <span className="text-xs text-secondary">3 locales</span>
            </span>
            <ChevronRight size={14} className="text-tertiary" />
          </button>
        )}
        <nav className="hide-scroll flex-1 overflow-y-auto px-2 py-3">
          {groups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[.12em] text-tertiary">
                  {group.label}
                </p>
              )}
              {group.items.map(([path, key, Icon]) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/app"}
                  title={collapsed ? t(language, key) : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "mb-0.5 flex h-10 items-center rounded-control text-sm font-medium text-secondary hover:bg-subtle hover:text-primary",
                      collapsed ? "justify-center px-2" : "gap-3 px-2.5",
                      isActive && "bg-brand-subtle text-primary",
                    )
                  }
                >
                  <Icon size={18} />
                  {!collapsed && t(language, key)}
                </NavLink>
              ))}
            </div>
          ))}
          {isDemoMode && user?.role === "owner" && (
            <div className="border-t pt-3">
              {!collapsed && (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[.12em] text-tertiary">
                  Validación
                </p>
              )}
              <SideLink
                path="/app/impact"
                label="Impacto"
                icon={Calculator}
                collapsed={collapsed}
              />
              <SideLink
                path="/app/feedback"
                label="Feedback"
                icon={ClipboardList}
                collapsed={collapsed}
              />
            </div>
          )}
        </nav>
        <div className="border-t p-2">
          <SideLink
            path="/app/settings"
            label="Configuración"
            icon={Settings}
            collapsed={collapsed}
          />
          <button
            className={cn(
              "flex h-10 w-full items-center rounded-control text-sm text-secondary hover:bg-subtle",
              collapsed ? "justify-center" : "gap-3 px-2.5",
            )}
            title={collapsed ? "Ayuda" : undefined}
          >
            <HelpCircle size={18} />
            {!collapsed && "Ayuda"}
          </button>
          {!collapsed && (
            <div className="mt-2 flex items-center gap-2 border-t pt-3">
              <span className="grid size-8 place-items-center rounded-full bg-brand text-xs font-semibold text-white">
                {user?.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-secondary">Propietaria</p>
              </div>
              <button
                onClick={signOut}
                className="grid size-9 place-items-center rounded-control"
                aria-label="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-24 hidden size-6 place-items-center rounded-full border bg-surface text-secondary shadow-sm lg:grid"
          aria-label={
            collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"
          }
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
      <div
        id="app-frame"
        className={cn(
          "transition-[padding] duration-200 motion-reduce:transition-none",
          collapsed ? "lg:pl-16" : "lg:pl-[232px]",
        )}
      >
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/92 px-3 backdrop-blur-md md:px-5">
          <button
            className="grid size-11 place-items-center rounded-control lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={19} />
          </button>
          <button
            onClick={() => setCommands(true)}
            aria-label="Buscar o ejecutar"
            aria-expanded={commands}
            className="flex h-9 min-w-0 max-w-md flex-1 items-center gap-2 rounded-control border bg-surface px-3 text-sm text-secondary hover:border-[rgb(var(--border-strong))] sm:flex-none sm:w-72"
          >
            <Search size={16} />
            <span className="truncate">Buscar o ejecutar…</span>
            <kbd className="ml-auto hidden rounded border bg-subtle px-1.5 py-0.5 text-[10px] sm:inline">
              ⌘K
            </kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            {isDemoMode && (
              <div className="hidden items-center gap-1 rounded-control bg-subtle p-1 md:flex">
                <select
                  value={scenario}
                  onChange={(event) =>
                    setScenario(event.target.value as DemoScenario)
                  }
                  className="h-8 rounded-md bg-transparent px-2 text-xs font-medium"
                  aria-label="Escenario demo"
                >
                  {Object.entries(demoScenarios).map(([value, data]) => (
                    <option key={value} value={value}>
                      {data.label}
                    </option>
                  ))}
                </select>
                <select
                  value={user?.role === "owner" ? "owner" : "staff"}
                  onChange={(event) => roleChange(event.target.value)}
                  className="h-8 rounded-md bg-transparent px-2 text-xs font-medium"
                  aria-label="Rol demo"
                >
                  <option value="owner">Dueño</option>
                  <option value="staff">Personal</option>
                  <option value="customer">Cliente</option>
                </select>
              </div>
            )}
            {isDemoMode && user?.role === "owner" && (
              <>
                <button
                  onClick={() => {
                    setTour(true);
                    navigate("/app");
                  }}
                  className="hidden size-10 place-items-center rounded-control text-secondary hover:bg-subtle xl:grid"
                  aria-label="Iniciar recorrido"
                >
                  <PlayCircle size={18} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("¿Restablecer demo?")) {
                      resetDemo();
                      navigate("/app");
                    }
                  }}
                  className="hidden size-10 place-items-center rounded-control text-secondary hover:bg-subtle xl:grid"
                  aria-label="Reset demo"
                >
                  <RotateCcw size={17} />
                </button>
              </>
            )}
            <button
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className="grid size-10 place-items-center rounded-control text-xs font-semibold text-secondary hover:bg-subtle"
              aria-label="Cambiar idioma"
            >
              {language.toUpperCase()}
            </button>
            <button
              onClick={toggleTheme}
              className="grid size-10 place-items-center rounded-control text-secondary hover:bg-subtle"
              aria-label="Cambiar tema"
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-[1440px] p-4 pb-24 md:p-6 lg:pb-8"
        >
          <Outlet />
        </main>
      </div>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-surface/95 p-1 backdrop-blur lg:hidden"
        aria-label="Navegación móvil"
      >
        {(
          [
            ["/app", "Inicio", LayoutDashboard],
            ["/app/customers", "Clientes", Users],
            ["/app/visits", "Visitas", QrCode],
            ["/app/campaigns", "Campañas", WalletCards],
          ] as const
        ).map(([path, label, Icon]) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/app"}
            className={({ isActive }) =>
              cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-control text-[10px] font-medium text-secondary",
                isActive && "text-primary",
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-control text-[10px] font-medium text-secondary"
        >
          <Menu size={18} />
          Más
        </button>
      </nav>
      {commands && (
        <CommandPalette
          open
          onClose={() => setCommands(false)}
          role={user?.role || "owner"}
        />
      )}
      {tour && <DemoTour onClose={() => setTour(false)} />}
    </div>
  );
}

function SideLink({
  path,
  label,
  icon: Icon,
  collapsed,
}: {
  path: string;
  label: string;
  icon: typeof Settings;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={path}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "mb-0.5 flex h-10 items-center rounded-control text-sm font-medium text-secondary hover:bg-subtle hover:text-primary",
          collapsed ? "justify-center px-2" : "gap-3 px-2.5",
          isActive && "bg-brand-subtle text-primary",
        )
      }
    >
      <Icon size={18} />
      {!collapsed && label}
    </NavLink>
  );
}

function StaffShell() {
  const { scenario, user, setDemoRole, logout } = useApp();
  const navigate = useNavigate();
  const data = demoScenarios[scenario];
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-surface">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <Logo />
          <span className="hidden h-5 border-l sm:block" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{data.locations[0]}</p>
            <p className="text-xs text-secondary">Modo personal</p>
          </div>
          <Badge tone="gold">Demo</Badge>
          <div className="ml-auto flex items-center gap-2">
            <select
              className="h-10 rounded-control border bg-surface px-2 text-xs font-medium"
              value="staff"
              onChange={(event) => {
                if (event.target.value === "owner") {
                  setDemoRole("owner");
                  navigate("/app");
                } else if (event.target.value === "customer")
                  navigate("/portal");
              }}
              aria-label="Rol demo"
            >
              <option value="owner">Dueño</option>
              <option value="staff">Personal</option>
              <option value="customer">Cliente</option>
            </select>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="grid size-11 place-items-center rounded-control text-secondary"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-3xl p-4 md:p-8">
        <Outlet />
      </main>
      <p className="sr-only">Sesión de {user?.name}</p>
    </div>
  );
}
