import { InvalidInputLinearError, LinearError } from "@linear/sdk";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  CreateIssueSchema,
  DeleteIssueSchema,
  UpdateIssueEstimateSchema,
  UpdateIssueLabelsSchema,
  UpdateIssuePrioritySchema,
  UpdateIssueSchema,
  UpdateIssueStateSchema,
} from "../schemas/issues.js";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";

export const createIssueTool: ToolCallback<
  typeof CreateIssueSchema.shape
> = async (args, extra) => {
  const client = await getLinearClient();
  try {
    const newIssue = await client.createIssue({
      teamId: args.teamId,
      title: args.title,
      description: args.description,
      projectId: args.projectId,
      estimate: args.estimate,
      priority:
        args.priority === "high" ? 1 : args.priority === "medium" ? 2 : 3,
    });

    const issuePayload = await newIssue.issue;
    if (!issuePayload) {
      logger.error("Issue not found after creation");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found after creation",
          },
        ],
        isError: true,
      };
    }

    logger.info("Created issue", {
      issueId: issuePayload.id,
      title: args.title,
      teamId: args.teamId,
    });

    const issue = await client.issue(issuePayload.id);
    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created issue: ${issue.title} (${issue.url})`,
        },
      ],
    };
  } catch (error) {
    if (error instanceof InvalidInputLinearError) {
      logger.error("Invalid input error", { error: error.message, args });
      return {
        content: [
          {
            type: "text" as const,
            text: `Invalid input: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    if (error instanceof LinearError) {
      logger.error("Linear API error", { error: error.message, args });
      return {
        content: [
          {
            type: "text" as const,
            text: `API error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    logger.error("Unexpected error", {
      error: error instanceof Error ? error.message : "Unknown error",
      args,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: "Unexpected error occurred",
        },
      ],
      isError: true,
    };
  }
};

export const updateIssueTool: ToolCallback<
  typeof UpdateIssueSchema.shape
> = async (args, extra) => {
  const client = await getLinearClient();
  try {
    const issue = await client.issue(args.issueId);
    if (!issue) {
      logger.error("Issue not found");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found",
          },
        ],
        isError: true,
      };
    }

    const updatedIssue = await issue.update({
      title: args.title,
      description: args.description,
    });

    const issuePayload = await updatedIssue.issue;
    if (!issuePayload) {
      logger.error("Issue not found after update");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found after update",
          },
        ],
        isError: true,
      };
    }

    logger.info("Updated issue", {
      issueId: issuePayload.id,
      title: args.title,
      description: args.description,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated issue: ${issue.title} (${issue.url})`,
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to update issue", {
      error: error instanceof Error ? error.message : "Unknown error",
      args,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: "Unexpected error occurred",
        },
      ],
      isError: true,
    };
  }
};

export const deleteIssueTool: ToolCallback<
  typeof DeleteIssueSchema.shape
> = async (args, extra) => {
  const client = await getLinearClient();
  try {
    const issue = await client.issue(args.issueId);
    if (!issue) {
      logger.error("Issue not found");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found",
          },
        ],
        isError: true,
      };
    }

    await issue.delete();

    logger.info("Deleted issue", {
      issueId: args.issueId,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully deleted issue: ${issue.title} (${issue.url})`,
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to delete issue", {
      error: error instanceof Error ? error.message : "Unknown error",
      args,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: "Unexpected error occurred",
        },
      ],
      isError: true,
    };
  }
};

export const updateIssueLabelsTool: ToolCallback<
  typeof UpdateIssueLabelsSchema.shape
> = async (args, extra) => {
  const client = await getLinearClient();
  try {
    const issue = await client.issue(args.issueId);
    if (!issue) {
      logger.error("Issue not found");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found",
          },
        ],
        isError: true,
      };
    }

    const updatedIssue = await issue.update({
      labelIds: args.labels,
    });

    const issuePayload = await updatedIssue.issue;
    if (!issuePayload) {
      logger.error("Issue not found after update");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found after update",
          },
        ],
        isError: true,
      };
    }

    logger.info("Updated issue labels", {
      issueId: issuePayload.id,
      labels: args.labels,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated issue labels: ${issue.title} (${issue.url})`,
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to update issue labels", {
      error: error instanceof Error ? error.message : "Unknown error",
      args,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: "Unexpected error occurred",
        },
      ],
      isError: true,
    };
  }
};

export const updateIssuePriorityTool: ToolCallback<
  typeof UpdateIssuePrioritySchema.shape
> = async (args, extra) => {
  const client = await getLinearClient();
  try {
    const issue = await client.issue(args.issueId);
    if (!issue) {
      logger.error("Issue not found");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found",
          },
        ],
        isError: true,
      };
    }

    const updatedIssue = await issue.update({
      priority:
        args.priority === "high" ? 1 : args.priority === "medium" ? 2 : 3,
    });

    const issuePayload = await updatedIssue.issue;
    if (!issuePayload) {
      logger.error("Issue not found after update");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found after update",
          },
        ],
        isError: true,
      };
    }

    logger.info("Updated issue priority", {
      issueId: issuePayload.id,
      priority: args.priority,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated issue priority: ${issue.title} (${issue.url})`,
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to update issue priority", {
      error: error instanceof Error ? error.message : "Unknown error",
      args,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: "Unexpected error occurred",
        },
      ],
      isError: true,
    };
  }
};

export const updateIssueEstimateTool: ToolCallback<
  typeof UpdateIssueEstimateSchema.shape
> = async (args, extra) => {
  const client = await getLinearClient();
  try {
    const issue = await client.issue(args.issueId);
    if (!issue) {
      logger.error("Issue not found");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found",
          },
        ],
        isError: true,
      };
    }

    const updatedIssue = await issue.update({
      estimate: args.estimate,
    });

    const issuePayload = await updatedIssue.issue;
    if (!issuePayload) {
      logger.error("Issue not found after update");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found after update",
          },
        ],
        isError: true,
      };
    }

    logger.info("Updated issue estimate", {
      issueId: issuePayload.id,
      estimate: args.estimate,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated issue estimate: ${issue.title} (${issue.url})`,
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to update issue estimate", {
      error: error instanceof Error ? error.message : "Unknown error",
      args,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: "Unexpected error occurred",
        },
      ],
      isError: true,
    };
  }
};

export const updateIssueStateTool: ToolCallback<
  typeof UpdateIssueStateSchema.shape
> = async (args, extra) => {
  const client = await getLinearClient();
  try {
    const issue = await client.issue(args.issueId);
    if (!issue) {
      logger.error("Issue not found");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found",
          },
        ],
        isError: true,
      };
    }

    const updatedIssue = await issue.update({
      stateId: args.status,
    });

    const issuePayload = await updatedIssue.issue;
    if (!issuePayload) {
      logger.error("Issue not found after update");
      return {
        content: [
          {
            type: "text" as const,
            text: "Issue not found after update",
          },
        ],
        isError: true,
      };
    }

    logger.info("Updated issue state", {
      issueId: issuePayload.id,
      stateId: args.status,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated issue state: ${issue.title} (${issue.url})`,
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to update issue state", {
      error: error instanceof Error ? error.message : "Unknown error",
      args,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: "Unexpected error occurred",
        },
      ],
      isError: true,
    };
  }
};
