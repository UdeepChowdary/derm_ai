import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { analyzeImageQuality } from "@/components/image-capture-guide";

describe("Image Quality Assessment", () => {
  let originalImage: typeof Image;

  beforeEach(() => {
    originalImage = globalThis.Image;

    // In jsdom, Image elements don't simulate network/canvas decode by default.
    // We provide a lightweight mock that invokes onload asynchronously.
    class MockImage {
      width = 800;
      height = 600;
      onload: (() => void) | null = null;
      private _src = "";

      set src(val: string) {
        this._src = val;
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
      get src() {
        return this._src;
      }
    }

    globalThis.Image = MockImage as any;
  });

  afterEach(() => {
    globalThis.Image = originalImage;
  });

  it("provides quality assessment metrics and recommendations", async () => {
    const sampleBase64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const result = await analyzeImageQuality(sampleBase64);

    expect(result).toBeDefined();
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("brightness");
    expect(result).toHaveProperty("contrast");
    expect(result).toHaveProperty("focus");
    expect(result).toHaveProperty("resolution");
    expect(Array.isArray(result.issues)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
