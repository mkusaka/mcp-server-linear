import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createIssue } from "../../src/handlers/issues.js";
import { ok, err } from "neverthrow";

// Mock the Linear SDK classes
vi.mock("@linear/sdk", () => {
  const LinearError = class LinearError extends Error {
    constructor(message) {
      super(message);
      this.name = "LinearError";
    }
  };
  
  const InvalidInputLinearError = class InvalidInputLinearError extends Error {
    constructor(message) {
      super(message);
      this.name = "InvalidInputLinearError";
    }
  };
  
  return {
    LinearError,
    InvalidInputLinearError,
  };
});

// Mock the neverthrow Result class
vi.mock("neverthrow", () => {
  return {
    ok: vi.fn((value) => ({
      isOk: () => true,
      isErr: () => false,
      value,
    })),
    err: vi.fn((error) => ({
      isOk: () => false,
      isErr: () => true,
      error,
    })),
    Result: {
      fromThrowable: vi.fn(),
    },
  };
});

vi.mock("../../src/utils/linear.js", () => {
  const mockLinearClient = {
    createIssue: vi.fn(({ teamId, title, description, projectId, estimate, priority }) => {
      if (teamId === "test-team-id") {
        return Promise.resolve({
          issue: {
            id: "new-mock-issue-id",
            title,
            description,
          },
        });
      }
      throw new Error("Team not found");
    }),
    issue: vi.fn((issueId) => {
      if (issueId === "new-mock-issue-id") {
        return Promise.resolve({
          id: "new-mock-issue-id",
          title: "Test Issue",
          description: "Test Description",
          url: "https://linear.app/team/issue/MOCK-123",
          state: { name: "Todo" },
          priority: 2,
        });
      }
      throw new Error("Issue not found");
    }),
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

describe("Issue Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createIssue", () => {
    it("should create a new issue successfully", async () => {
      const input = {
        title: "Test Issue",
        description: "Test Description",
        teamId: "test-team-id",
      };

      const result = await createIssue(input);

      expect(result.isOk).toBeDefined();
      expect(result.isOk()).toBe(true);
      
      if (result.isOk()) {
        const issue = result.value;
        expect(issue.id).toBe("new-mock-issue-id");
        expect(issue.title).toBe("Test Issue");
        expect(issue.url).toBe("https://linear.app/team/issue/MOCK-123");
      }

      // Verify Linear client was called with correct parameters
      const { getLinearClient } = await import("../../src/utils/linear.js");
      const mockClient = getLinearClient();
      expect(mockClient.createIssue).toHaveBeenCalledWith({
        teamId: "test-team-id",
        title: "Test Issue",
        description: "Test Description",
        projectId: undefined,
        estimate: undefined,
        priority: 3,
      });
    });

    it("should handle API errors", async () => {
      const input = {
        title: "Test Issue",
        description: "Test Description",
        teamId: "invalid-team-id",
      };

      const { getLinearClient } = await import("../../src/utils/linear.js");
      const mockClient = getLinearClient();
      const { LinearError } = await import("@linear/sdk");
      mockClient.createIssue = vi.fn().mockImplementation(() => {
        throw new LinearError("API Error");
      });

      const result = await createIssue(input);

      expect(result.isErr).toBeDefined();
      expect(result.isErr()).toBe(true);
      
      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("API_ERROR");
        expect(error.message).toBe("API Error");
      }

      // Verify error was logged
      const { logger } = await import("../../src/utils/logger.js");
      expect(logger.error).toHaveBeenCalledWith("Linear API error", expect.any(Object));
    });

    it("should handle invalid input errors", async () => {
      const input = {
        title: "Test Issue",
        description: "Test Description",
        teamId: "invalid-team-id",
      };

      const { getLinearClient } = await import("../../src/utils/linear.js");
      const mockClient = getLinearClient();
      const { InvalidInputLinearError } = await import("@linear/sdk");
      mockClient.createIssue = vi.fn().mockImplementation(() => {
        throw new InvalidInputLinearError("Invalid input");
      });

      const result = await createIssue(input);

      expect(result.isErr).toBeDefined();
      expect(result.isErr()).toBe(true);
      
      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("INVALID_INPUT");
        expect(error.message).toBe("Invalid input");
      }

      // Verify error was logged
      const { logger } = await import("../../src/utils/logger.js");
      expect(logger.error).toHaveBeenCalledWith("Invalid input error", expect.any(Object));
    });

    it("should handle unexpected errors", async () => {
      const input = {
        title: "Test Issue",
        description: "Test Description",
        teamId: "test-team-id",
      };

      const { getLinearClient } = await import("../../src/utils/linear.js");
      const mockClient = getLinearClient();
      mockClient.createIssue = vi.fn().mockRejectedValue(new Error("Unexpected error"));

      const result = await createIssue(input);

      expect(result.isErr).toBeDefined();
      expect(result.isErr()).toBe(true);
      
      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("API_ERROR");
        expect(error.message).toBe("Unexpected error occurred");
      }

      // Verify error was logged
      const { logger } = await import("../../src/utils/logger.js");
      expect(logger.error).toHaveBeenCalledWith("Unexpected error", expect.any(Object));
    });

    it("should handle issue not found after creation", async () => {
      const input = {
        title: "Test Issue",
        description: "Test Description",
        teamId: "test-team-id",
      };

      const { getLinearClient } = await import("../../src/utils/linear.js");
      const mockClient = getLinearClient();
      mockClient.createIssue = vi.fn().mockResolvedValue({
        issue: null,
      });

      const result = await createIssue(input);

      expect(result.isErr).toBeDefined();
      expect(result.isErr()).toBe(true);
      
      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("NOT_FOUND");
        expect(error.message).toBe("Issue not found after creation");
      }

      // Verify error was logged
      const { logger } = await import("../../src/utils/logger.js");
      expect(logger.error).toHaveBeenCalledWith("Issue not found after creation");
    });
  });
});
