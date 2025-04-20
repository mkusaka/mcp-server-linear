import { describe, it, expect, beforeEach, vi } from "vitest";
import { getViewerResource } from "../../src/resources/viewer.js";

vi.mock("../../src/utils/linear.js", () => {
  return {
    resetLinearClient: vi.fn(),
    getLinearClient: vi.fn(() => ({
      get viewer() {
        throw new Error("API error");
      }
    })),
  };
});

describe("Viewer Resource Error Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    vi.clearAllMocks();
  });

  describe("getViewerResource", () => {
    it("should handle API errors", async () => {
      const result = await getViewerResource({}, {
        auth: { apiKey: process.env.LINEAR_API_KEY },
      } as any);

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(data).toHaveProperty("error", "Unexpected error");
        expect(data).toHaveProperty("message", "API error");
      }
    });
  });
});
