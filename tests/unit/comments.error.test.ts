import { describe, it, expect, beforeEach, vi } from "vitest";
import { LinearError } from "@linear/sdk";

vi.mock("@linear/sdk", () => {
  return {
    LinearError: class LinearError extends Error {
      constructor(options) {
        super(typeof options === "object" ? options.message : options);
        this.name = "LinearError";
      }
    },
    InvalidInputLinearError: class InvalidInputLinearError extends Error {
      constructor(message) {
        super(message);
        this.name = "InvalidInputLinearError";
      }
    },
  };
});

vi.mock("../../src/utils/linear.js", () => {
  return {
    resetLinearClient: vi.fn(),
    getLinearClient: vi.fn(() => {
      throw new LinearError({ message: "API error" });
    }),
  };
});

describe("Comment Tools Error Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    vi.clearAllMocks();
  });

  describe("getIssueCommentsResource", () => {
    it("should handle API errors", async () => {
      const { getIssueCommentsResource } = await import("../../src/tools/comments.js");
      
      const result = await getIssueCommentsResource(
        { issueId: "invalid-issue-id" },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any
      );

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(data).toHaveProperty("error", "Failed to get issue comments");
        expect(data).toHaveProperty("message", "API error");
      }
    });
  });

  describe("createCommentTool", () => {
    it("should handle API errors", async () => {
      const { createCommentTool } = await import("../../src/tools/comments.js");
      
      const result = await createCommentTool(
        {
          issueId: "invalid-issue-id",
          body: "Test comment",
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any
      );

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(data).toHaveProperty("error", "Linear API error");
        expect(data).toHaveProperty("message", "API error");
      }
    });
  });

  describe("updateCommentTool", () => {
    it("should handle API errors", async () => {
      const { updateCommentTool } = await import("../../src/tools/comments.js");
      
      const result = await updateCommentTool(
        {
          commentId: "invalid-comment-id",
          body: "Updated comment",
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any
      );

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(data).toHaveProperty("error", "Linear API error");
        expect(data).toHaveProperty("message", "API error");
      }
    });
  });

  describe("deleteCommentTool", () => {
    it("should handle API errors", async () => {
      const { deleteCommentTool } = await import("../../src/tools/comments.js");
      
      const result = await deleteCommentTool(
        {
          commentId: "invalid-comment-id",
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any
      );

      expect(result).toBeDefined();
      expect(result.isError).toBe(true);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(data).toHaveProperty("error", "Linear API error");
        expect(data).toHaveProperty("message", "API error");
      }
    });
  });
});
