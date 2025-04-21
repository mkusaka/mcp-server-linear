import { InvalidInputLinearError, LinearError } from "@linear/sdk";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { UpdateProjectStateSchema } from "../schemas/issues.js";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";

export const updateProjectStateTool: ToolCallback<
  typeof UpdateProjectStateSchema.shape
> = async (args, extra) => {
  const client = getLinearClient();
  try {
    const project = await client.project(args.projectId as string);
    if (!project) {
      logger.error("Project not found");
      return {
        content: [
          {
            type: "text" as const,
            text: "Project not found",
          },
        ],
        isError: true,
      };
    }

    const updatedProjectPayload = await client.updateProject(args.projectId, {
      statusId: args.statusId,
    });

    const projectPayload = await updatedProjectPayload.project;
    if (!projectPayload) {
      logger.error("Project not found after update");
      return {
        content: [
          {
            type: "text" as const,
            text: "Project not found after update",
          },
        ],
        isError: true,
      };
    }

    logger.info("Updated project state", {
      projectId: projectPayload.id,
      statusId: args.statusId,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated project state: ${project.name} (${project.url})`,
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
    logger.error("Failed to update project state", {
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
