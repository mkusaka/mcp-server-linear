import { InvalidInputLinearError, LinearError } from "@linear/sdk";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";
import { ReadResourceCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

export const getViewerResource: ReadResourceCallback = async (uri) => {
  const client = getLinearClient();
  try {
    const viewer = await client.viewer;
    logger.info("Retrieved viewer info", { viewerId: viewer.id });

    const teams = await viewer.teams();
    const viewerData = {
      id: viewer.id,
      name: viewer.name,
      email: viewer.email,
      teamIds: teams.nodes.map((team) => team.id),
    };

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(viewerData, null, 2),
          mimeType: "application/json"
        },
      ],
    };
  } catch (error) {
    logger.error("Failed to get viewer", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    if (error instanceof InvalidInputLinearError) {
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            error: "Invalid input",
            message: error.message
          }, null, 2),
          mimeType: "application/json"
        }]
      };
    }
    if (error instanceof LinearError) {
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            error: "Linear API error",
            message: error.message
          }, null, 2),
          mimeType: "application/json"
        }]
      };
    }
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          error: "Unexpected error",
          message: error instanceof Error ? error.message : "Unknown error"
        }, null, 2),
        mimeType: "application/json"
      }]
    };
  }
};
