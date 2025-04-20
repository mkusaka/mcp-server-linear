import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createIssueTool,
  updateIssueTool,
  deleteIssueTool,
} from "../../src/tools/issues.js";

vi.mock("../../src/utils/linear.js", () => {
  const mockStatusList = [
    { id: "state-123", name: "Todo" },
    { id: "status-1", name: "In Progress" },
    { id: "status-2", name: "Done" },
  ];

  const mockLinearClient = {
    createIssue: vi.fn(({ teamId, title, description }) => {
      return Promise.resolve({
        issue: {
          id: "new-mock-issue-id",
          title,
          description,
          url: "https://linear.app/team/issue/MOCK-123",
        },
      });
    }),
    issue: vi.fn((issueId) => {
      return Promise.resolve({
        id: issueId,
        title: "Test Issue",
        description: "Test Description",
        url: "https://linear.app/team/issue/MOCK-123",
        state: { name: "Todo" },
        priority: 2,
        identifier: "MOCK-123",
        update: vi.fn().mockResolvedValue({
          issue: {
            id: issueId,
            title: "Updated Test Issue",
            description: "Updated Test Description",
          },
        }),
        delete: vi.fn().mockResolvedValue(true),
      });
    }),
    projectStatuses: vi.fn().mockResolvedValue({
      nodes: mockStatusList,
    }),
  };

  return {
    resetLinearClient: vi.fn(),
    getLinearClient: vi.fn().mockImplementation(() => Promise.resolve(mockLinearClient)),
    issueStatusList: mockStatusList,
  };
});

describe("Tool Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    vi.clearAllMocks();

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createIssueTool", () => {
    it("should attempt to create a new issue", async () => {
      const result = await createIssueTool(
        {
          title: "Test Issue",
          description: "Test Description",
          teamId: "test-team-id",
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      expect(typeof result.content[0].text).toBe("string");
    });
  });

  describe("updateIssueTool", () => {
    it("should attempt to update an existing issue", async () => {
      const result = await updateIssueTool(
        {
          issueId: "mock-issue-id",
          title: "Updated Test Issue",
          description: "Updated Test Description",
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      expect(typeof result.content[0].text).toBe("string");
    });
  });

  describe("deleteIssueTool", () => {
    it("should attempt to delete an existing issue", async () => {
      const result = await deleteIssueTool(
        {
          issueId: "mock-issue-id",
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      expect(typeof result.content[0].text).toBe("string");
    });
  });
});
