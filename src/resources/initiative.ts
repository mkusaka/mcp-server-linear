import { InvalidInputLinearError, LinearError } from "@linear/sdk";
import { ReadResourceCallback, ReadResourceTemplateCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";

export const getInitiativesResource: ReadResourceCallback = async (uri) => {
  const client = getLinearClient();
  try {
    const initiatives = await client.initiatives()

    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          initiatives: initiatives.nodes
        }, null, 2),
        mimeType: "application/json"
      }]
    };
  } catch (error) {
    logger.error("Failed to get initiatives", {
      error: error instanceof Error ? error.message : "Unknown error",
      teamId: uri.searchParams.get("teamId")
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

export const getInitiativeResource: ReadResourceTemplateCallback = async (uri, variables) => {
  const client = getLinearClient();
  try {
    const initiative = await client.initiative(variables.initiativeId as string);
    
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(initiative, null, 2),
        mimeType: "application/json"
      }]
    };
  } catch (error) {
    logger.error("Failed to get initiative", {
      error: error instanceof Error ? error.message : "Unknown error",
      initiativeId: variables.initiativeId
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
