import { describe, expect, it } from "vitest";
import { createMeasurementSchema, isWeakPassword } from "./validation";

describe("validation", () => {
  it("rejects a height outside the allowed range", async () => {
    const schema = createMeasurementSchema(true);
    const measurement = (height: string) => ({
      measured_at: "2024-01-01",
      height,
    });

    await expect(schema.isValid(measurement("49"))).resolves.toBe(false);
    await expect(schema.isValid(measurement("176"))).resolves.toBe(false);
    await expect(schema.isValid(measurement("160,5"))).resolves.toBe(true);
  });

  it("flags weak passwords", () => {
    expect(isWeakPassword("Jelszo-Valami-Hosszu-Szo")).toBe(true);
    expect(isWeakPassword("Zold-Alma-Kert-Fa-Hegy")).toBe(false);
  });
});
