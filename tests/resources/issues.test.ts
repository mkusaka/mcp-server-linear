import { describe, it, expect, beforeEach } from "vitest";
import {
  getProjectIssuesResource,
  getInitiativeIssuesResource,
  getIssueResource,
} from "../../src/resources/issues";
import { ReadResourceTemplateCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import "../mocks/linear";

describe("issues", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "test-api-key";
  });

  it("should get project issues", async () => {
    const result = await getProjectIssuesResource(
      new URL("http://example.com/project/123/issues"),
      { projectId: "test-project-id" },
      {} as ReadResourceTemplateCallback,
    );

    expect(result.contents).toHaveLength(1);
    const content = JSON.parse(result.contents[0].text);
    expect(content).toMatchObject({
      project: {
        id: "test-project-id",
        name: "Test Project",
      },
      issues: [
        {
          id: "test-issue-1",
          title: "Test Issue 1",
          description: "Test Description 1",
        },
        {
          id: "test-issue-2",
          title: "Test Issue 2",
          description: "Test Description 2",
        },
      ],
    });
  });

  it("should get initiative issues", async () => {
    const result = await getInitiativeIssuesResource(
      new URL("http://example.com/initiative/123/issues"),
      { initiativeId: "test-initiative-id" },
      {} as ReadResourceTemplateCallback,
    );

    expect(result.contents).toHaveLength(1);
    const content = JSON.parse(result.contents[0].text);
    expect(content).toMatchObject({
      initiative: {
        id: "test-initiative-id",
        name: "Test Initiative",
      },
      issues: [
        {
          id: "test-issue-1",
          title: "Test Issue 1",
          description: "Test Description 1",
        },
      ],
    });
  });

  it("should get single issue", async () => {
    const result = await getIssueResource(
      new URL("http://example.com/issue/123"),
      { issueId: "test-issue-id" },
      {} as ReadResourceTemplateCallback,
    );

    expect(result.contents).toHaveLength(1);
    const content = JSON.parse(result.contents[0].text);
    expect(content).toMatchObject({
      id: "test-issue-id",
      title: "Test Issue",
      description: "Test Description",
    });
  });
});
