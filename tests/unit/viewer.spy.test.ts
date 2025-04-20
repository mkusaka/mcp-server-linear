import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { getViewerResource } from "../../src/resources/viewer.js";
import { getLinearClient } from "../../src/utils/linear.js";

const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

describe("Viewer Resource Handlers with Spy", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    consoleSpy.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getViewerResource", () => {
    it("should handle API errors", async () => {
      vi.mock("../../src/utils/linear.js", () => ({
        getLinearClient: vi.fn().mockImplementation(() => ({
          get viewer() {
            throw new Error("API error");
          }
        })),
        resetLinearClient: vi.fn(),
      }));

      const result = await getViewerResource({}, {
        auth: { apiKey: process.env.LINEAR_API_KEY },
      } as any);

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      // expect(consoleSpy).toHaveBeenCalled();

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(data).toHaveProperty("error");
        expect(data.error).toBe("Unexpected error");
        // expect(consoleSpy).toHaveBeenCalled();
      }
    });
  });
});
