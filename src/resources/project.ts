import { InvalidInputLinearError, LinearError } from "@linear/sdk";
import { ReadResourceCallback, ReadResourceTemplateCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";

export const getProjectsResource: ReadResourceCallback = async (uri) => {
  const client = getLinearClient();
  try {
    const teamId = uri.searchParams.get("teamId");
    const projects = await client.projects({
      includeArchived: false
    });

    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          projects: projects.nodes
        }, null, 2),
        mimeType: "application/json"
      }]
    };
  } catch (error) {
    logger.error("Failed to get projects", {
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

export const getProjectResource: ReadResourceTemplateCallback = async (uri, variables) => {
  const client = getLinearClient();
  try {
    const project = await client.project(variables.projectId as string);
    
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(project, null, 2),
        mimeType: "application/json"
      }]
    };
  } catch (error) {
    logger.error("Failed to get project", {
      error: error instanceof Error ? error.message : "Unknown error",
      projectId: variables.projectId
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
