import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchIssuesTool } from "../../src/tools/searchIssues.js";

vi.mock("../../src/schemas/issueFilters.js", () => {
  return {
    SearchIssuesSchema: {
      parse: vi.fn((input) => input),
    },
  };
});

vi.mock("../../src/utils/linear.js", () => {
  const mockIssues = [
    {
      id: "mock-issue-1",
      identifier: "MOCK-1",
      title: "Mock Issue 1",
      description: "Mock Issue 1 Description",
      url: "https://linear.app/team/issue/MOCK-1",
      state: Promise.resolve({
        id: "state-1",
        name: "Todo",
        type: "unstarted",
        color: "#ff0000",
      }),
      assignee: Promise.resolve({
        id: "user-1",
        name: "User 1",
        email: "user1@example.com",
      }),
      team: Promise.resolve({
        id: "team-1",
        name: "Team 1",
        key: "TEAM1",
      }),
      project: Promise.resolve({
        id: "project-1",
        name: "Project 1",
      }),
      priority: 2,
      labels: Promise.resolve({
        nodes: () =>
          Promise.resolve([
            {
              id: "label-1",
              name: "Bug",
              color: "#ff0000",
            },
          ]),
      }),
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-02T00:00:00Z",
    },
    {
      id: "mock-issue-2",
      identifier: "MOCK-2",
      title: "Mock Issue 2",
      description: "Mock Issue 2 Description",
      url: "https://linear.app/team/issue/MOCK-2",
      state: Promise.resolve({
        id: "state-2",
        name: "In Progress",
        type: "started",
        color: "#ffff00",
      }),
      assignee: null,
      team: Promise.resolve({
        id: "team-1",
        name: "Team 1",
        key: "TEAM1",
      }),
      project: null,
      priority: 1,
      labels: Promise.resolve({
        nodes: () => Promise.resolve([]),
      }),
      createdAt: "2023-01-03T00:00:00Z",
      updatedAt: "2023-01-04T00:00:00Z",
    },
  ];

  const mockConnection = {
    nodes: mockIssues,
    pageInfo: {
      hasNextPage: false,
      endCursor: null,
    },
  };

  const mockLinearClient = {
    issues: vi.fn().mockResolvedValue(mockConnection),
    client: {
      rawRequest: vi.fn(), // Keep for backward compatibility
    },
  };

  return {
    resetLinearClient: vi.fn(),
    getLinearClient: vi.fn(() => mockLinearClient),
  };
});

vi.mock("../../src/utils/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Search Issues Tool", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("searchIssuesTool", () => {
    it("should search issues with default parameters", async () => {
      const result = await searchIssuesTool({
        filter: {},
        first: 50,
        orderBy: "updatedAt",
        orderDirection: "DESC",
      });

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty("nodes");
      expect(data.nodes).toHaveLength(2);
      expect(data.nodes[0].id).toBe("mock-issue-1");
      expect(data.nodes[1].id).toBe("mock-issue-2");

      const { getLinearClient } = await import("../../src/utils/linear.js");
      const mockClient = await getLinearClient();

      expect(mockClient.issues).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.any(Object),
          first: 50,
          orderBy: "updatedAt",
          orderDirection: "DESC",
        }),
      );
    });

    it("should search issues with custom parameters", async () => {
      const result = await searchIssuesTool({
        filter: { teamId: "team-1" },
        first: 10,
        orderBy: "createdAt",
        orderDirection: "DESC",
      });

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);

      const { getLinearClient } = await import("../../src/utils/linear.js");
      const mockClient = await getLinearClient();

      expect(mockClient.issues).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            team: expect.objectContaining({
              id: expect.objectContaining({ eq: "team-1" }),
            }),
          }),
          first: 10,
          orderBy: "createdAt",
          orderDirection: "DESC",
        }),
      );
    });

    it("should handle pagination parameters", async () => {
      const result = await searchIssuesTool({
        filter: {},
        first: 50,
        orderBy: "updatedAt",
        orderDirection: "DESC",
        after: "cursor-123",
      });

      expect(result).toBeDefined();

      const { getLinearClient } = await import("../../src/utils/linear.js");
      const mockClient = await getLinearClient();

      expect(mockClient.issues).toHaveBeenCalledWith(
        expect.objectContaining({
          after: "cursor-123",
        }),
      );
    });

    it("should handle errors gracefully", async () => {
      const { getLinearClient } = await import("../../src/utils/linear.js");
      const mockClient = getLinearClient();
      mockClient.issues = vi.fn().mockRejectedValue(new Error("API Error"));

      const result = await searchIssuesTool({
        filter: {},
        first: 50,
        orderBy: "updatedAt",
        orderDirection: "DESC",
      });

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain(
        "Error searching issues: API Error",
      );
      expect(result.isError).toBe(true);

      const { logger } = await import("../../src/utils/logger.js");
      expect(logger.error).toHaveBeenCalledWith(
        "Error searching issues",
        expect.any(Object),
      );
    });
  });
});
