import { describe, it, expect, vi } from "vitest";
import {
  CreateIssueSchema,
  GetProjectSchema,
  GetProjectIssuesSchema,
  GetIssueSchema,
  UpdateIssueSchema,
  DeleteIssueSchema,
  UpdateIssueLabelsSchema,
  UpdateIssuePrioritySchema,
  UpdateIssueEstimateSchema,
  UpdateIssueStateSchema,
} from "../../src/schemas/issues.js";

vi.mock("../../src/utils/linear.js", () => {
  const mockStatusList = [
    { id: "state-123", name: "Todo" },
    { id: "status-1", name: "In Progress" },
    { id: "status-2", name: "Done" },
  ];

  return {
    issueStatusList: mockStatusList,
  };
});

describe("Issue Schemas", () => {
  describe("CreateIssueSchema", () => {
    it("should validate a valid issue creation input", () => {
      const validInput = {
        title: "Test Issue",
        description: "Test Description",
        teamId: "team-123",
        priority: "medium",
      };

      const result = CreateIssueSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject input with missing required fields", () => {
      const invalidInput = {
        description: "Test Description",
      };

      const result = CreateIssueSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.path.includes("title"))).toBe(
          true,
        );
        expect(result.error.errors.some((e) => e.path.includes("teamId"))).toBe(
          true,
        );
      }
    });

    it("should validate optional fields", () => {
      const inputWithOptionals = {
        title: "Test Issue",
        description: "Test Description",
        teamId: "team-123",
        projectId: "project-123",
        parentId: "parent-123",
        dependencyIds: ["dep-1", "dep-2"],
        labels: ["label-1", "label-2"],
        estimate: 5,
        priority: "high",
      };

      const result = CreateIssueSchema.safeParse(inputWithOptionals);
      expect(result.success).toBe(true);
    });

    it("should reject invalid priority values", () => {
      const invalidInput = {
        title: "Test Issue",
        description: "Test Description",
        teamId: "team-123",
        priority: "invalid-priority", // Not in enum
      };

      const result = CreateIssueSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.errors.some((e) => e.path.includes("priority")),
        ).toBe(true);
      }
    });
  });

  describe("GetProjectSchema", () => {
    it("should validate a valid project request", () => {
      const validInput = {
        projectId: "project-123",
      };

      const result = GetProjectSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject empty projectId", () => {
      const invalidInput = {
        projectId: "",
      };

      const result = GetProjectSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("GetProjectIssuesSchema", () => {
    it("should validate a valid project issues request", () => {
      const validInput = {
        projectId: "project-123",
      };

      const result = GetProjectIssuesSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject empty projectId", () => {
      const invalidInput = {
        projectId: "",
      };

      const result = GetProjectIssuesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("GetIssueSchema", () => {
    it("should validate a valid issue request", () => {
      const validInput = {
        issueId: "issue-123",
      };

      const result = GetIssueSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should use default values for optional fields", () => {
      const validInput = {
        issueId: "issue-123",
      };

      const result = GetIssueSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeComments).toBe(true);
        expect(result.data.includeChildren).toBe(true);
        expect(result.data.includeParent).toBe(true);
      }
    });

    it("should allow overriding default values", () => {
      const validInput = {
        issueId: "issue-123",
        includeComments: false,
        includeChildren: false,
        includeParent: false,
      };

      const result = GetIssueSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.includeComments).toBe(false);
        expect(result.data.includeChildren).toBe(false);
        expect(result.data.includeParent).toBe(false);
      }
    });
  });

  describe("UpdateIssueSchema", () => {
    it("should validate a valid issue update", () => {
      const validInput = {
        issueId: "issue-123",
        title: "Updated Title",
        description: "Updated Description",
      };

      const result = UpdateIssueSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should allow partial updates", () => {
      const validInput = {
        issueId: "issue-123",
        title: "Updated Title",
      };

      const result = UpdateIssueSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject empty issueId", () => {
      const invalidInput = {
        issueId: "",
        title: "Updated Title",
      };

      const result = UpdateIssueSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("DeleteIssueSchema", () => {
    it("should validate a valid issue deletion", () => {
      const validInput = {
        issueId: "issue-123",
      };

      const result = DeleteIssueSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject empty issueId", () => {
      const invalidInput = {
        issueId: "",
      };

      const result = DeleteIssueSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateIssueLabelsSchema", () => {
    it("should validate a valid labels update", () => {
      const validInput = {
        issueId: "issue-123",
        labels: ["label-1", "label-2"],
      };

      const result = UpdateIssueLabelsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should allow empty labels array", () => {
      const validInput = {
        issueId: "issue-123",
        labels: [],
      };

      const result = UpdateIssueLabelsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("UpdateIssuePrioritySchema", () => {
    it("should validate a valid priority update", () => {
      const validInput = {
        issueId: "issue-123",
        priority: "high",
      };

      const result = UpdateIssuePrioritySchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject invalid priority values", () => {
      const invalidInput = {
        issueId: "issue-123",
        priority: "invalid-priority", // Not in enum
      };

      const result = UpdateIssuePrioritySchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateIssueEstimateSchema", () => {
    it("should validate a valid estimate update", () => {
      const validInput = {
        issueId: "issue-123",
        estimate: 5,
      };

      const result = UpdateIssueEstimateSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject non-numeric estimates", () => {
      const invalidInput = {
        issueId: "issue-123",
        estimate: "five", // Not a number
      };

      const result = UpdateIssueEstimateSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateIssueStateSchema", () => {
    it("should validate a valid state update", () => {
      const validInput = {
        issueId: "issue-123",
        status: "state-123",
      };

      const result = UpdateIssueStateSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject empty status", () => {
      const invalidInput = {
        issueId: "issue-123",
        status: "",
      };

      const result = UpdateIssueStateSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
