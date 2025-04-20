import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getIssueCommentsResource,
  createCommentTool,
  updateCommentTool,
  deleteCommentTool,
} from "../../src/tools/comments.js";

vi.mock("../../src/utils/linear.js", () => {
  const mockLinearClient = {
    issue: vi.fn((issueId) => {
      if (issueId === "mock-issue-id") {
        return Promise.resolve({
          comments: vi.fn(() =>
            Promise.resolve({
              nodes: [
                {
                  id: "mock-comment-id-1",
                  body: "Mock comment 1",
                  createdAt: "2023-01-01T00:00:00Z",
                  updatedAt: "2023-01-01T00:00:00Z",
                  user: {
                    id: "mock-user-id",
                    name: "Mock User",
                  },
                },
                {
                  id: "mock-comment-id-2",
                  body: "Mock comment 2",
                  createdAt: "2023-01-02T00:00:00Z",
                  updatedAt: "2023-01-02T00:00:00Z",
                  user: {
                    id: "mock-user-id",
                    name: "Mock User",
                  },
                },
              ],
            }),
          ),
        });
      }
      throw new Error("Issue not found");
    }),
    createComment: vi.fn(({ issueId, body }) => {
      if (issueId === "mock-issue-id") {
        return Promise.resolve({
          success: true,
          comment: {
            id: "new-comment-id",
            body,
          },
        });
      }
      throw new Error("Issue not found");
    }),
    updateComment: vi.fn((commentId, { body }) => {
      if (commentId === "mock-comment-id") {
        return Promise.resolve({
          success: true,
          comment: {
            id: commentId,
            body,
          },
        });
      }
      throw new Error("Comment not found");
    }),
    deleteComment: vi.fn((commentId) => {
      if (commentId === "mock-comment-id") {
        return Promise.resolve({ success: true });
      }
      throw new Error("Comment not found");
    }),
  };

  return {
    resetLinearClient: vi.fn(),
    getLinearClient: vi.fn(() => mockLinearClient),
  };
});

describe("Comment Tools", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getIssueCommentsResource", () => {
    it("should return issue comments", async () => {
      const result = await getIssueCommentsResource(
        { issueId: "mock-issue-id" },
        { auth: { apiKey: "test-api-key" } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(data).toHaveProperty("comments");
        expect(data.comments).toBeDefined();
      }
    });
  });

  describe("createCommentTool", () => {
    it("should create a new comment", async () => {
      const result = await createCommentTool(
        {
          issueId: "mock-issue-id",
          body: "Test comment",
        },
        { auth: { apiKey: "test-api-key" } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Comment created successfully");
    });
  });

  describe("updateCommentTool", () => {
    it("should update an existing comment", async () => {
      const result = await updateCommentTool(
        {
          commentId: "mock-comment-id",
          body: "Updated comment",
        },
        { auth: { apiKey: "test-api-key" } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Comment updated successfully");
    });
  });

  describe("deleteCommentTool", () => {
    it("should delete an existing comment", async () => {
      const result = await deleteCommentTool(
        {
          commentId: "mock-comment-id",
        },
        { auth: { apiKey: "test-api-key" } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Comment deleted successfully");
    });
  });
});
