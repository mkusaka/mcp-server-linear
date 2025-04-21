import { beforeEach, describe, expect, it } from "vitest";
import {
  getIssueResource,
  getProjectIssuesResource,
} from "../../src/resources/issues.js";
import { getProjectResource } from "../../src/resources/project.js";
import { resetLinearClient } from "../../src/utils/linear.js";

describe("Resource Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    resetLinearClient();
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
        expect(contentItem.mimeType).toBe("application/json");
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
        expect(contentItem.mimeType).toBe("application/json");
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
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].mimeType).toBe("application/json");
    });
  });
});
