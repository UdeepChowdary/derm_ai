// @vitest-environment node
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as analyzeHandler } from "@/app/api/analyze/route";
import { GET as uvHandler } from "@/app/api/uv/route";

describe("Server API Proxy Routes", () => {
  describe("POST /api/analyze", () => {
    it("returns 400 if 'file' is missing from request", async () => {
      const formData = new FormData();
      formData.append("model", "autoderm_v2_2");

      const req = new NextRequest("http://localhost:3000/api/analyze", {
        method: "POST",
        body: formData,
      });

      const response = await analyzeHandler(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain("Missing required 'file'");
    });

    it("handles request with file and responds gracefully (e.g. demo mode when no key set)", async () => {
      const formData = new FormData();
      const dummyFile = new File(["sample image bytes"], "test.jpg", { type: "image/jpeg" });
      formData.append("file", dummyFile);

      const req = new NextRequest("http://localhost:3000/api/analyze", {
        method: "POST",
        body: formData,
      });

      const response = await analyzeHandler(req);
      const data = await response.json();

      expect([200, 400, 429]).toContain(response.status);
      expect(data).toBeDefined();
    });
  });

  describe("GET /api/uv", () => {
    it("returns 400 if coordinates are missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/uv", {
        method: "GET",
      });

      const response = await uvHandler(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("returns environmental data for valid coordinates", async () => {
      const req = new NextRequest("http://localhost:3000/api/uv?lat=37.7749&lon=-122.4194", {
        method: "GET",
      });

      const response = await uvHandler(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.uv).toBeDefined();
      expect(typeof data.uv.index).toBe("number");
      expect(data.pollution).toBeDefined();
      expect(typeof data.pollution.aqi).toBe("number");
    });
  });
});
