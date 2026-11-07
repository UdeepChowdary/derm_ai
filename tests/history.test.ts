import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock idb-keyval
vi.mock("idb-keyval", () => {
  const store = new Map<string, any>();
  return {
    get: vi.fn(async (key: string) => store.get(key)),
    set: vi.fn(async (key: string, val: any) => {
      store.set(key, val);
    }),
    del: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

describe("History Storage Logic (idb-keyval)", () => {
  const STORAGE_KEY = "dermascan-reports";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores and retrieves reports correctly", async () => {
    const { get, set } = await import("idb-keyval");

    const sampleReport = {
      id: "report-101",
      date: new Date().toISOString(),
      condition: "Eczema",
      description: "Mild redness",
      severity: "Moderate",
      recommendations: ["Moisturize"],
      imageUrl: "data:image/png;base64,sample",
    };

    await set(STORAGE_KEY, [sampleReport]);
    expect(set).toHaveBeenCalledWith(STORAGE_KEY, [sampleReport]);

    const retrieved = await get(STORAGE_KEY);
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].condition).toBe("Eczema");
  });

  it("clears stored reports on delete", async () => {
    const { get, del } = await import("idb-keyval");

    await del(STORAGE_KEY);
    expect(del).toHaveBeenCalledWith(STORAGE_KEY);

    const afterDelete = await get(STORAGE_KEY);
    expect(afterDelete).toBeUndefined();
  });
});
