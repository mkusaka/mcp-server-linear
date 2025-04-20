import { describe, it, expect, beforeEach, vi } from "vitest";
import { getViewerResource } from "../../src/resources/viewer.js";
import { resetLinearClient } from "../../src/utils/linear.js";
import { http, HttpResponse } from "msw";
import { server } from "../setup";

describe("Viewer Resource Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    resetLinearClient();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("getViewerResource", () => {
    it("should return viewer details", async () => {
      server.use(
        http.post("https://api.linear.app/graphql", async ({ request }) => {
          const body = await request.json();
          const { query } = body as { query: string };
          
          return HttpResponse.json({
            data: {
              viewer: {
                id: "mock-user-id",
                name: "Mock User",
                email: "mock.user@example.com",
                teams: {
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
                },
              },
            },
          });
        })
      );

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
        expect(data.viewer).toHaveProperty("id");
        expect(data.viewer).toHaveProperty("name");
        expect(data.viewer).toHaveProperty("email");
        expect(data.viewer).toHaveProperty("teams");
        expect(Array.isArray(data.viewer.teams)).toBe(true);
      }
    });

    it("should handle API errors", async () => {
      server.use(
        http.post("https://api.linear.app/graphql", () => {
          return HttpResponse.json(
            {
              errors: [{ message: "API error" }],
            },
            { status: 200 },
          );
        }),
      );

      const result = await getViewerResource(
        {},
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
      );

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      expect(result.content[0].type).toBe("text");

      const errorData = JSON.parse(result.content[0].text as string);
      expect(errorData).toHaveProperty("error");
    });
  });
});
