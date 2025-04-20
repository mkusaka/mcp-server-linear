import { InvalidInputLinearError, LinearError } from "@linear/sdk";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";
import {
  GetProjectIssuesSchema,
  GetIssueSchema,
  GetIssueStatusListSchema,
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
          type: "text" as const,
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
            mimeType: "application/json",
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
            mimeType: "application/json",
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
          mimeType: "application/json",
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

    const stateData = await issue.state;

    let comments: {
      id: string;
      body: string;
      user: { id: string; name: string } | null;
      createdAt: Date;
    }[] = [];
    if (args.includeComments) {
      const commentsData = await issue.comments({
        includeArchived: false,
        orderBy: LinearDocument.PaginationOrderBy.CreatedAt,
      });
      comments = await Promise.all(
        commentsData.nodes.map(async (comment) => {
          const user = await comment.user;
          return {
            id: comment.id,
            body: comment.body,
            user: user
              ? {
                  id: user.id,
                  name: user.name,
                }
              : null,
            createdAt: comment.createdAt,
          };
        }),
      );
    }

    let children: {
      id: string;
      title: string;
      description: string | undefined;
      state: {
        type: any;
        name: any;
      };
    }[] = [];
    if (args.includeChildren) {
      const childrenData = await issue.children();
      children = await Promise.all(
        childrenData.nodes.map(async (child) => {
          const childState = await child.state;
          return {
            id: child.id,
            title: child.title,
            description: child.description,
            state: {
              type: childState,
              name: childState,
            },
          };
        }),
      );
    }

    let parent = null;
    if (args.includeParent) {
      const parentData = await issue.parent;
      if (parentData) {
        const parentState = await parentData.state;
        parent = {
          id: parentData.id,
          title: parentData.title,
          description: parentData.description,
          state: {
            type: parentState,
            name: parentState,
          },
        };
      }
    }

    const labelsData = await issue.labels();
    const labels = labelsData.nodes.map((label) => ({
      id: label.id,
      name: label.name,
      description: label.description,
    }));

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              issue: {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                state: {
                  type: stateData,
                  name: stateData,
                },
                comments,
                children,
                parent,
                labels,
              },
            },
            null,
            2,
          ),
          mimeType: "application/json",
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
            mimeType: "application/json",
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
            mimeType: "application/json",
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
          mimeType: "application/json",
        },
      ],
      isError: true,
    };
  }
};

export const getIssueStatusListResource: ToolCallback<
  typeof GetIssueStatusListSchema.shape
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
          mimeType: "application/json",
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
          mimeType: "application/json",
        },
      ],
    };
  }
};
