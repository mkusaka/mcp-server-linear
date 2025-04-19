import { InvalidInputLinearError, LinearError } from "@linear/sdk";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";
import {
  GetProjectIssuesSchema,
  GetIssueSchema,
  GetProjectStatusesSchema,
  GetIssuePrioritiesSchema,
} from "../schemas/issues.js";
import { LinearDocument } from "@linear/sdk";

export const getProjectIssuesResource: ToolCallback<
  typeof GetProjectIssuesSchema.shape
> = async (args, extra) => {
  const client = getLinearClient();
  try {
    const project = await client.project(args.projectId as string);
    const issues = await project.issues({
      filter: {
        state: {
          type: { nin: ["completed", "canceled"] },
        },
      },
      orderBy: LinearDocument.PaginationOrderBy.UpdatedAt,
      first: 100,
    });

    return {
      content: [
        {
          type: "resource" as const,
          resource: {
            uri: `issues://projects/${args.projectId}/issues`,
            text: JSON.stringify(
              {
                project: {
                  id: project.id,
                  name: project.name,
                  description: project.description,
                  state: project.state,
                },
                issues: issues.nodes.map((issue) => ({
                  id: issue.id,
                  title: issue.title,
                  description: issue.description,
                  state: {
                    type: issue.state,
                    name: issue.state,
                  },
                })),
              },
              null,
              2,
            ),
            mimeType: "application/json",
          },
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to get project issues", {
      error: error instanceof Error ? error.message : "Unknown error",
      projectId: args.projectId,
    });

    if (error instanceof InvalidInputLinearError) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: "Invalid input",
                message: error.message,
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
    if (error instanceof LinearError) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: "Linear API error",
                message: error.message,
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: "Unexpected error",
              message: error instanceof Error ? error.message : "Unknown error",
            },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }
};

export const getIssueResource: ToolCallback<
  typeof GetIssueSchema.shape
> = async (args, extra) => {
  const client = getLinearClient();
  try {
    const issue = await client.issue(args.issueId as string);
    const commentsData = (async () => {
      if (!args.includeComments) {
        return [];
      }
      const comments = await issue.comments({
        includeArchived: false,
        orderBy: LinearDocument.PaginationOrderBy.CreatedAt,
      });
      return await Promise.all(
        comments.nodes.map(async (comment) => ({
          id: comment.id,
          body: comment.body,
          user: await (async () => {
            const user = await comment.user;
            if (!user) {
              return null;
            }
            return {
              id: user.id,
              name: user.name,
            };
          })(),
          createdAt: comment.createdAt,
        })),
      );
    })();

    const childrenData = (async () => {
      if (!args.includeChildren) {
        return [];
      }
      const children = await issue.children();
      return children.nodes.map((child) => {
        return {
          id: child.id,
          title: child.title,
          description: child.description,
          state: {
            type: child.state,
            name: child.state,
          },
        };
      });
    })();

    const parentData = (async () => {
      if (!args.includeParent) {
        return null;
      }
      const parent = await issue.parent;
      if (!parent) {
        return null;
      }
      return {
        id: parent.id,
        title: parent.title,
        description: parent.description,
        state: {
          type: parent.state,
          name: parent.state,
        },
      };
    })();
    return {
      content: [
        {
          type: "resource" as const,
          resource: {
            uri: `issues://${args.issueId}`,
            text: JSON.stringify(
              {
                issue: {
                  id: issue.id,
                  title: issue.title,
                  description: issue.description,
                  state: {
                    type: issue.state,
                    name: issue.state,
                  },
                  comments: commentsData,
                  children: childrenData,
                  parent: parentData,
                },
              },
              null,
              2,
            ),
            mimeType: "application/json",
          },
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to get issue", {
      error: error instanceof Error ? error.message : "Unknown error",
      issueId: args.issueId,
    });

    if (error instanceof InvalidInputLinearError) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: "Invalid input",
                message: error.message,
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
    if (error instanceof LinearError) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: "Linear API error",
                message: error.message,
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: "Unexpected error",
              message: error instanceof Error ? error.message : "Unknown error",
            },
            null,
            2,
          ),
        },
      ],
      isError: true,
    };
  }
};

export const getProjectStatusesResource: ToolCallback<
  typeof GetProjectStatusesSchema.shape
> = async (args, extra) => {
  const client = getLinearClient();
  try {
    const statuses = await client.projectStatuses();
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              statuses: statuses.nodes.map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                position: s.position,
              })),
            },
            null,
            2,
          ),
          mimeType: "application/json",
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to get project statuses", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { error: "Failed to get project statuses" },
            null,
            2,
          ),
        },
      ],
    };
  }
};

export const getIssuePrioritiesResource: ToolCallback<
  typeof GetIssuePrioritiesSchema.shape
> = async (args, extra) => {
  const client = getLinearClient();
  try {
    const priorities = await client.issuePriorityValues;
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              priorities: priorities.map((p) => ({
                label: p.label,
                priority: p.priority,
              })),
            },
            null,
            2,
          ),
          mimeType: "application/json",
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to get issue priorities", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            { error: "Failed to get issue priorities" },
            null,
            2,
          ),
        },
      ],
    };
  }
};
