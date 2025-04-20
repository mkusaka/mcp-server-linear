import { describe, it, expect, beforeEach, vi } from "vitest";
import { getViewerResource } from "../../src/resources/viewer.js";
import { resetLinearClient } from "../../src/utils/linear.js";
import { LinearError } from "@linear/sdk";

const successMock = {
  resetLinearClient: vi.fn(),
  getLinearClient: vi.fn(() => ({
    viewer: {
      id: "mock-user-id",
      name: "Mock User",
      email: "mock.user@example.com",
      teams: vi.fn().mockResolvedValue({
        nodes: [
          {
            id: "mock-team-id-1",
            name: "Team 1",
            key: "TEAM1",
          },
          {
            id: "mock-team-id-2",
            name: "Team 2",
            key: "TEAM2",
          },
        ],
      }),
    },
  })),
};

const errorMock = {
  resetLinearClient: vi.fn(),
  getLinearClient: vi.fn(() => {
    throw new LinearError("API error");
  }),
};

describe("Viewer Resource Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    vi.clearAllMocks();
  });

  describe("getViewerResource", () => {
    it("should return viewer details", async () => {
      vi.doMock("../../src/utils/linear.js", () => successMock);

      const result = await getViewerResource({}, {
        auth: { apiKey: process.env.LINEAR_API_KEY },
      } as any);

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(data).toHaveProperty("viewer");
        expect(data.viewer).toHaveProperty("id");
        expect(data.viewer).toHaveProperty("name");
        expect(data.viewer).toHaveProperty("email");
        expect(data.viewer).toHaveProperty("teams");
        expect(Array.isArray(data.viewer.teams)).toBe(true);
      }
    });

    it("should handle API errors", async () => {
      vi.doMock("../../src/utils/linear.js", () => errorMock);

      const result = await getViewerResource({}, {
        auth: { apiKey: process.env.LINEAR_API_KEY },
      } as any);

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text as string);
        expect(data).toHaveProperty("error");
        expect(data.error).toBe("Linear API error");
      }
    });
  });
});
