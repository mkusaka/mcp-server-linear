import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetIssueLabelsSchema } from "../schemas/labels.js";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";

export const getIssueLabelsResource: ToolCallback<
  typeof GetIssueLabelsSchema.shape
> = async (args, extra) => {
  const client = await getLinearClient();

  try {
    const labels = await client.issueLabels();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              labels: labels.nodes.map((l) => ({
                id: l.id,
                name: l.name,
                description: l.description,
                color: l.color,
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
    logger.error("Failed to get issue labels", { error });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { error: "Failed to get issue labels" },
            null,
            2,
          ),
        },
      ],
    };
  }
};
