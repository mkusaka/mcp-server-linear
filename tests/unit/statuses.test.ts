import { beforeEach, describe, expect, it } from "vitest";
import {
  getIssueStatesResource,
  getProjectStatusesResource,
} from "../../src/resources/issues.js";
import { resetLinearClient } from "../../src/utils/linear.js";

describe("Status Resource Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    resetLinearClient();
  });

  describe("getProjectStatusesResource", () => {
    it("should return project statuses", async () => {
      const result = await getProjectStatusesResource(
        {},
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
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
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
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
