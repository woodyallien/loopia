import { expect, test } from "vitest";
import { hexToChannels, purchaseForReward } from "../lib/analytics";
import { greeting } from "../lib/i18n";

test("purchase needed for next reward subtracts the visit bonus", () => {
  const rules = { pointsPerSol: 1, visitBonus: 25 };
  expect(purchaseForReward(0, rules)).toBe(0);
  expect(purchaseForReward(20, rules)).toBe(0);
  expect(purchaseForReward(125, rules)).toBe(100);
  expect(purchaseForReward(126, { pointsPerSol: 2, visitBonus: 25 })).toBe(51);
});

test("hex colors become css channel triplets", () => {
  expect(hexToChannels("#23473b")).toBe("35 71 59");
  expect(hexToChannels("nope")).toBeNull();
});

test("greeting follows the time of day", () => {
  expect(greeting("es", new Date(2026, 0, 1, 9))).toBe("Buenos días");
  expect(greeting("en", new Date(2026, 0, 1, 15))).toBe("Good afternoon");
  expect(greeting("es", new Date(2026, 0, 1, 21))).toBe("Buenas noches");
});
