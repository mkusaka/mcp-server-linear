import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getIssueStatesResource,
  getProjectStatusesResource,
} from "../../src/resources/issues.js";
import { resetLinearClient } from "../../src/utils/linear.js";

vi.mock("@linear/sdk", () => {
  return {
    LinearClient: vi.fn().mockImplementation(() => ({
      projectStatuses: vi.fn().mockResolvedValue({
        nodes: [
          {
            id: "mock-project-status-1",
            name: "Not Started",
            description: "Project has not started yet",
            position: 1,
          },
          {
            id: "mock-project-status-2",
            name: "In Progress",
            description: "Project is in progress",
            position: 2,
          },
        ],
      }),
      workflowStates: vi.fn().mockResolvedValue({
        nodes: [
          {
            id: "mock-workflow-state-1",
            name: "Backlog",
            type: "backlog",
          },
          {
            id: "mock-workflow-state-2",
            name: "Todo",
            type: "unstarted",
          },
        ],
      }),
    })),
    InvalidInputLinearError: class {},
    LinearError: class {},
    LinearDocument: {
      PaginationOrderBy: {
        UpdatedAt: "updatedAt",
        CreatedAt: "createdAt",
      },
    },
  };
});

describe("Status Resource Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    resetLinearClient();
    vi.clearAllMocks();
  });

  describe("getProjectStatusesResource", () => {
    it("should return project statuses", async () => {
      const result = await getProjectStatusesResource(
        {},
        {
          auth: { apiKey: process.env.LINEAR_API_KEY },
        } as any
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(typeof data).toBe("object");
        expect(data.statuses).toBeDefined();
        expect(Array.isArray(data.statuses)).toBe(true);
        expect(data.statuses.length).toBeGreaterThan(0);
        expect(data.statuses[0].id).toBeDefined();
        expect(data.statuses[0].name).toBeDefined();
        expect(contentItem.mimeType).toBe("application/json");
      }
    });
  });

  describe("getIssueStatesResource", () => {
    it("should return issue states (workflow states)", async () => {
      const result = await getIssueStatesResource(
        {},
        {
          auth: { apiKey: process.env.LINEAR_API_KEY },
        } as any
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(typeof data).toBe("object");
        expect(data.states).toBeDefined();
        expect(Array.isArray(data.states)).toBe(true);
        expect(data.states.length).toBeGreaterThan(0);
        expect(data.states[0].id).toBeDefined();
        expect(data.states[0].name).toBeDefined();
        expect(contentItem.mimeType).toBe("application/json");
      }
    });
  });
});
