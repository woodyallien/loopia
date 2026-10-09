import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../context/AppContext";
import App from "../App";
import { calculatePoints, convertReferral } from "../lib/utils";

const renderApp = (path = "/login") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <App />
      </AppProvider>
    </MemoryRouter>,
  );

test("demo login opens dashboard", async () => {
  renderApp();
  await userEvent.click(
    await screen.findByRole("button", { name: "Usar cuenta demo" }),
  );
  expect(
    await screen.findByText(
      "¿Qué está pasando con tus clientes?",
      {},
      { timeout: 5000 },
    ),
  ).toBeInTheDocument();
});
test("invalid demo login shows an error", async () => {
  renderApp();
  const password = await screen.findByLabelText("Contraseña");
  await userEvent.clear(password);
  await userEvent.type(password, "wrong");
  await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));
  expect(screen.getByRole("alert")).toHaveTextContent("incorrectos");
});
test("customer search filters the directory", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app/customers");
  const search = await screen.findByPlaceholderText(
    "Buscar por nombre, teléfono o código",
  );
  await userEvent.type(search, "Carlos");
  expect(screen.getAllByText(/Carlos/).length).toBeGreaterThan(0);
  await userEvent.clear(search);
  await userEvent.type(search, "does-not-exist");
  expect(screen.getByText("No encontramos clientes")).toBeInTheDocument();
});
test("visit point calculation includes spend and visit", () => {
  expect(calculatePoints(83, 1)).toEqual({
    base: 83,
    visit: 25,
    milestone: 0,
    manual: 0,
    total: 108,
  });
  expect(calculatePoints(50, 4).total).toBe(175);
});
test("visit creation reaches confirmation", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Staff", role: "staff" }),
  );
  renderApp("/app/visits");
  await userEvent.click(
    await screen.findByRole("button", { name: /Escanear QR/ }),
  );
  expect(screen.getByText("Carlos Quispe")).toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", { name: "Registrar visita y puntos" }),
  );
  expect(screen.getByText("Visita registrada")).toBeInTheDocument();
});
test("reward can be redeemed in demo", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app/rewards");
  const buttons = await screen.findAllByRole("button", {
    name: "Canjear demo",
  });
  await userEvent.click(buttons[0]);
  expect(screen.getByRole("button", { name: "Canjeada" })).toBeDisabled();
});
test("referral conversion awards both customers", () => {
  expect(convertReferral(true)).toEqual({
    referrerPoints: 150,
    referredPoints: 50,
    status: "converted",
  });
});
test("campaign creation adds a draft", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app/campaigns");
  await userEvent.click(
    await screen.findByRole("button", { name: /Nueva campaña/ }),
  );
  await userEvent.click(
    screen.getByRole("button", { name: /Guardar borrador/ }),
  );
  expect(screen.getAllByText("Campaña de recuperación").length).toBeGreaterThan(
    0,
  );
});
test("language toggle changes navigation copy", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app");
  await userEvent.click(
    await screen.findByRole("button", { name: "Cambiar idioma" }),
  );
  expect(screen.getAllByText("Customers").length).toBeGreaterThan(0);
});
test("theme toggle changes document class", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app");
  fireEvent.click(await screen.findByRole("button", { name: "Cambiar tema" }));
  expect(document.documentElement).toHaveClass("dark");
});
test("staff role is redirected away from analytics", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Staff", role: "staff" }),
  );
  renderApp("/app");
  expect(await screen.findByText("Escanear cliente")).toBeInTheDocument();
  expect(screen.queryByText("Clientes")).not.toBeInTheDocument();
});
test("demo admin can switch business scenario", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app");
  const selector = await screen.findByLabelText("Escenario demo");
  await userEvent.selectOptions(selector, "bar");
  expect(await screen.findByText("Mirador Nocturno")).toBeInTheDocument();
  expect(localStorage.getItem("loopia-demo-scenario")).toBe("bar");
});
test("impact simulator calculates and labels hypothetical estimates", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app/impact");
  expect(
    await screen.findByRole("heading", { name: "Simulador de impacto" }),
  ).toBeInTheDocument();
  expect(screen.getByText("420")).toBeInTheDocument();
  expect(screen.getAllByText("Estimación hipotética").length).toBeGreaterThan(
    0,
  );
});
test("validation tools remain hidden from staff", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Staff", role: "staff" }),
  );
  renderApp("/app/visits");
  expect(await screen.findByText("Escanear cliente")).toBeInTheDocument();
  expect(screen.queryByLabelText("Escenario demo")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Reset demo" }),
  ).not.toBeInTheDocument();
});
test("command palette supports keyboard search and dismissal", async () => {
  const user = userEvent.setup();
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app");
  await screen.findByRole("heading", {
    name: "¿Qué está pasando con tus clientes?",
  });
  const trigger = screen.getByRole("button", { name: /Buscar o ejecutar/i });
  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  const search = await screen.findByRole("combobox", {
    name: "Buscar comandos, clientes y páginas",
  });
  await user.type(search, "Registrar visita");
  expect(
    screen.getByRole("option", { name: /Registrar visita/ }),
  ).toBeInTheDocument();
  await user.keyboard("{ArrowDown}");
  await user.keyboard("{Escape}");
  expect(
    screen.queryByRole("dialog", { name: "Buscar o ejecutar" }),
  ).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
test("command palette opens with Ctrl+K", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app");
  await screen.findByRole("heading", {
    name: "¿Qué está pasando con tus clientes?",
  });
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  expect(
    await screen.findByRole("combobox", {
      name: "Buscar comandos, clientes y páginas",
    }),
  ).toBeInTheDocument();
});
test("customer quick view restores focus to selected row", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app/customers");
  const row = await screen.findByRole("row", { name: /Carlos Quispe/ });
  row.focus();
  fireEvent.keyDown(row, { key: "Enter" });
  expect(
    await screen.findByRole("dialog", { name: "Vista rápida del cliente" }),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Cerrar panel" }));
  expect(row).toHaveFocus();
});
test("demo role switch opens intentional staff shell", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app");
  const role = await screen.findByLabelText("Rol demo");
  await userEvent.selectOptions(role, "staff");
  expect(await screen.findByText("Modo personal")).toBeInTheDocument();
  expect(screen.queryByText("Crecimiento")).not.toBeInTheDocument();
});
test("onboarding advances through progressive steps", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app/onboarding");
  expect(
    await screen.findByRole("heading", { name: "Cuéntanos sobre tu negocio" }),
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /Continuar/ }));
  expect(
    await screen.findByRole("heading", { name: "Crea tu primer local" }),
  ).toBeInTheDocument();
});
test("demo center starts a guided journey and advances across routes", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app/demo");
  expect(
    await screen.findByRole("heading", { name: "Centro de demostración" }),
  ).toBeInTheDocument();
  await userEvent.click(
    screen.getAllByRole("button", { name: "Iniciar historia" })[0],
  );
  expect((await screen.findAllByText("La oportunidad aparece sola")).length).toBeGreaterThan(0);
  expect(screen.getByText("Modo presentador · 1 de 5")).toBeInTheDocument();
  await screen.findByRole("heading", { name: "¿Qué está pasando con tus clientes?" });
  await waitFor(() => expect(document.querySelector('[data-demo-highlight="true"]')).toBeTruthy());
  await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
  expect((await screen.findAllByText("Cliente en riesgo")).length).toBeGreaterThan(0);
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("region", { name: "Panel del recorrido demo" })).not.toBeInTheDocument();
});
test("demo journey supports customer view and completion handoff", async () => {
  sessionStorage.setItem(
    "loopia-user",
    JSON.stringify({ name: "Admin", role: "owner" }),
  );
  renderApp("/app/demo");
  const card = await screen.findByRole("heading", { name: "Así lo vive tu cliente" });
  await userEvent.click(card.closest("div.card")?.querySelector("button") as HTMLElement);
  expect(await screen.findByText("Modo presentador · 1 de 6")).toBeInTheDocument();
  expect((await screen.findAllByText("Registro simple")).length).toBeGreaterThan(0);
  await userEvent.click(screen.getByRole("button", { name: "Vista cliente" }));
  expect(screen.getByText("Vista cliente · 1 de 6")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /Contraer panel demo/ }));
  expect(screen.getByRole("region", { name: "Panel del recorrido demo" })).toHaveTextContent("1 de 6");
});
