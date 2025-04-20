import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getProjectIssuesResource,
  getIssueResource,
} from "../../src/resources/issues.js";
import { getProjectResource } from "../../src/resources/project.js";

vi.mock("../../src/utils/linear.js", () => {
  const mockStatusList = [
    { id: "state-123", name: "Todo" },
    { id: "status-1", name: "In Progress" },
    { id: "status-2", name: "Done" },
  ];

  const mockLinearClient = {
    project: vi.fn((projectId) => {
      return Promise.resolve({
        id: projectId,
        name: "Mock Project",
        issues: vi.fn().mockResolvedValue({
          nodes: [
            {
              id: "mock-issue-id",
              title: "Mock Issue",
              description: "Mock Description",
              state: "Todo",
              priority: 2,
              identifier: "MOCK-123",
            },
          ],
        }),
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
        comments: vi.fn().mockResolvedValue({ nodes: [] }),
        children: vi.fn().mockResolvedValue({ nodes: [] }),
        parent: vi.fn().mockResolvedValue(null),
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

describe("Resource Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    vi.clearAllMocks();
  });

  describe("getProjectIssuesResource", () => {
    it("should return project issues", async () => {
      const result = await getProjectIssuesResource(
        {
          projectId: "mock-project-id",
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(typeof data).toBe("object");
      } else if (contentItem.type === "resource") {
        const resource = contentItem.resource;
        expect(resource.uri).toBe("issues://projects/mock-project-id/issues");
        expect(typeof resource.text).toBe("string");
      }
    });
  });

  describe("getIssueResource", () => {
    it("should return issue details", async () => {
      const result = await getIssueResource(
        {
          issueId: "mock-issue-id",
          includeComments: true,
          includeChildren: true,
          includeParent: true,
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(typeof data).toBe("object");
      } else if (contentItem.type === "resource") {
        const resource = contentItem.resource;
        expect(resource.uri).toBe("issues://mock-issue-id");
        expect(typeof resource.text).toBe("string");
      }
    });
  });

  describe("getProjectResource", () => {
    it("should return project details", async () => {
      const result = await getProjectResource(
        {
          projectId: "mock-project-id",
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
    });
  });
});
