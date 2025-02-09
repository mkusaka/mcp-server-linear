import { InvalidInputLinearError, LinearError } from "@linear/sdk";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CreateIssueSchema } from "../schemas/issues.js";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";

export const createIssueTool: ToolCallback<typeof CreateIssueSchema.shape> = async (args, extra) => {
  const client = getLinearClient();
  try {
    const newIssue = await client.createIssue({
      teamId: args.teamId,
      title: args.title,
      description: args.description,
      projectId: args.projectId,
      estimate: args.estimate,
      priority: args.priority === "high" ? 1 : args.priority === "medium" ? 2 : 3,
    });

    const issuePayload = await newIssue.issue;
    if (!issuePayload) {
      logger.error("Issue not found after creation");
      return {
        content: [{
          type: "text" as const,
          text: "Issue not found after creation"
        }],
        isError: true
      };
    }

    logger.info("Created issue", { 
      issueId: issuePayload.id,
      title: args.title,
      teamId: args.teamId 
    });

    const issue = await client.issue(issuePayload.id);
    return {
      content: [{
        type: "text" as const,
        text: `Successfully created issue: ${issue.title} (${issue.url})`
      }]
    };
  } catch (error) {
    if (error instanceof InvalidInputLinearError) {
      logger.error("Invalid input error", { error: error.message, args });
      return {
        content: [{
          type: "text" as const,
          text: `Invalid input: ${error.message}`
        }],
        isError: true
      };
    }
    if (error instanceof LinearError) {
      logger.error("Linear API error", { error: error.message, args });
      return {
        content: [{
          type: "text" as const,
          text: `API error: ${error.message}`
        }],
        isError: true
      };
    }
    logger.error("Unexpected error", { 
      error: error instanceof Error ? error.message : "Unknown error",
      args 
    });
    return {
      content: [{
        type: "text" as const,
        text: "Unexpected error occurred"
      }],
      isError: true
    };
  }
}; 
