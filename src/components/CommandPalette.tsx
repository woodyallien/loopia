import { useEffect, useRef, useState } from "react";
import {
  Gift,
  Megaphone,
  QrCode,
  Search,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { customers } from "../data/mock";
import type { Role } from "../lib/types";
import { Modal } from "./ui";

const commands = [
  ["Ir a Clientes", "/app/customers", "Navegación", Users],
  ["Ir a Campañas", "/app/campaigns", "Navegación", Megaphone],
  ["Registrar visita", "/app/visits", "Sugerido", QrCode],
  ["Crear campaña", "/app/campaigns", "Sugerido", Megaphone],
  ["Crear recompensa", "/app/rewards", "Sugerido", Gift],
  ["Ver clientes inactivos", "/app/customers", "Sugerido", UserRound],
  ["Abrir configuración", "/app/settings", "Navegación", Settings],
] as const;
export function CommandPalette({
  open,
  onClose,
  role,
}: {
  open: boolean;
  onClose: () => void;
  role: Role;
}) {
  const [query, setQuery] = useState(""),
    [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const allowed =
    role === "staff"
      ? commands.filter((item) => item[1] === "/app/visits")
      : commands;
  const customerResults =
    role === "staff"
      ? []
      : customers
          .filter((customer) =>
            customer.name.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 4)
          .map(
            (customer) =>
              [
                `Buscar cliente ${customer.name}`,
                `/app/customers/${customer.id}`,
                "Clientes",
                UserRound,
              ] as const,
          );
  const results = [...allowed, ...customerResults].filter((item) =>
    item[0].toLowerCase().includes(query.toLowerCase()),
  );
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      window.setTimeout(() => input.current?.focus(), 0);
    }
  }, [open]);
  useEffect(() => setActive(0), [query]);
  const choose = (path: string) => {
    navigate(path);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Buscar o ejecutar">
      <div className="-mx-1">
        <label className="relative block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
            size={18}
          />
          <span className="sr-only">Buscar comandos, clientes y páginas</span>
          <input
            ref={input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((value) => Math.min(results.length - 1, value + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((value) => Math.max(0, value - 1));
              }
              if (event.key === "Home") {
                event.preventDefault();
                setActive(0);
              }
              if (event.key === "End") {
                event.preventDefault();
                setActive(results.length - 1);
              }
              if (event.key === "Enter" && results[active])
                choose(results[active][1]);
            }}
            className="input h-12 pl-10 pr-14"
            placeholder="Buscar clientes, páginas o acciones…"
            role="combobox"
            aria-label="Buscar comandos, clientes y páginas"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={
              results[active] ? `command-${active}` : undefined
            }
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-subtle px-1.5 py-0.5 text-[10px] text-secondary">
            ESC
          </kbd>
        </label>
        <div
          id="command-results"
          role="listbox"
          className="mt-3 max-h-80 overflow-auto"
        >
          {results.length ? (
            results.map(([label, path, group, Icon], index) => (
              <button
                tabIndex={-1}
                id={`command-${index}`}
                role="option"
                aria-selected={active === index}
                key={`${label}-${path}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(path)}
                className={`flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left ${active === index ? "bg-brand-subtle" : ""}`}
              >
                <Icon size={17} className="text-secondary" />
                <span className="flex-1 text-sm font-medium">{label}</span>
                <span className="text-xs text-tertiary">{group}</span>
              </button>
            ))
          ) : (
            <p className="p-8 text-center text-sm text-secondary">
              No encontramos resultados.
            </p>
          )}
        </div>
        <div className="mt-3 flex gap-4 border-t pt-3 text-[11px] text-tertiary">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc cerrar</span>
        </div>
      </div>
    </Modal>
  );
}
