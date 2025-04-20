import { describe, it, expect, beforeEach, vi } from "vitest";
import { getViewerResource } from "../../src/resources/viewer.js";
import { LinearError } from "@linear/sdk";

vi.mock("../../src/utils/linear.js", () => {
  const mockLinearClient = {
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
  };

  return {
    resetLinearClient: vi.fn(),
    getLinearClient: vi.fn(() => mockLinearClient),
  };
});

describe("Viewer Resource Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    vi.clearAllMocks();
  });

  describe("getViewerResource", () => {
    it("should return viewer details", async () => {
      const result = await getViewerResource(
        {},
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(data).toHaveProperty("viewer");
        expect(data.viewer).toHaveProperty("id", "mock-user-id");
        expect(data.viewer).toHaveProperty("name", "Mock User");
        expect(data.viewer).toHaveProperty("email", "mock.user@example.com");
        expect(data.viewer).toHaveProperty("teams");
        expect(Array.isArray(data.viewer.teams)).toBe(true);
        expect(data.viewer.teams).toHaveLength(2);
        expect(data.viewer.teams[0]).toHaveProperty("id", "mock-team-id-1");
        expect(data.viewer.teams[0]).toHaveProperty("name", "Team 1");
        expect(data.viewer.teams[0]).toHaveProperty("key", "TEAM1");
      }
    });
  });
});
