import { describe, expect, it } from "vitest";
import {
  BUDGET_BANDS,
  SUPPORTED_COUNTRIES,
  citiesForCountry,
  defaultBudgetRange,
  suggestCity,
} from "./catalog";

describe("global launch locations", () => {
  it("covers every locale region with at least one service city", () => {
    expect(SUPPORTED_COUNTRIES).toHaveLength(10);
    for (const country of SUPPORTED_COUNTRIES) {
      const cities = citiesForCountry(country.code);
      expect(cities.length).toBeGreaterThan(0);
      expect(cities.some((city) => city.key === country.defaultCityKey)).toBe(
        true,
      );
      for (const city of cities) {
        expect(city.neighborhoods.length).toBeGreaterThanOrEqual(5);
        expect(BUDGET_BANDS[city.currency]).toBeDefined();
      }
    }
  });

  it("uses timezone before language region when suggesting a city", () => {
    expect(suggestCity("US", "America/Los_Angeles").city).toBe("San Francisco");
    expect(suggestCity("CA", "America/Toronto").city).toBe("Toronto");
    expect(suggestCity("AU", "Australia/Sydney").city).toBe("Sydney");
  });

  it("falls back to the region's launch city", () => {
    expect(suggestCity("FR", "UTC").city).toBe("Paris");
    expect(suggestCity("NL", undefined).city).toBe("Amsterdam");
    expect(suggestCity("SE", "UTC").city).toBe("Stockholm");
  });

  it("creates step-aligned starter budgets in every launch currency", () => {
    for (const [currency, band] of Object.entries(BUDGET_BANDS)) {
      const budget = defaultBudgetRange(currency);
      expect(budget.min).toBeGreaterThanOrEqual(band.min);
      expect(budget.max).toBeLessThanOrEqual(band.max);
      expect(budget.min % band.step).toBe(0);
      expect(budget.max % band.step).toBe(0);
    }
  });
});
