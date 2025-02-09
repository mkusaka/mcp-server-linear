import { InvalidInputLinearError, LinearError } from "@linear/sdk";
import { ReadResourceTemplateCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";

export const getProjectIssuesResource: ReadResourceTemplateCallback = async (uri, variables) => {
  const client = getLinearClient();
  try {
    const project = await client.project(variables.projectId as string);
    const issues = await project.issues({
      filter: {
        state: {
          type: { nin: ["completed", "canceled"] }
        }
      }
    });

    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          project,
          issues: issues.nodes
        }, null, 2),
        mimeType: "application/json"
      }]
    };
  } catch (error) {
    logger.error("Failed to get project issues", {
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

export const getInitiativeIssuesResource: ReadResourceTemplateCallback = async (uri, variables) => {
  const client = getLinearClient();
  try {
    const initiative = await client.initiative(variables.initiativeId as string);
    const projects = await initiative.projects();
    
    const projectIssues = await Promise.all(
      projects.nodes.map(async (project) => {
        const issues = await project.issues({
          filter: {
            state: {
              type: { nin: ["completed", "canceled"] }
            }
          }
        });
        return issues.nodes;
      })
    );

    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          initiative,
          issues: projectIssues.flat()
        }, null, 2),
        mimeType: "application/json"
      }]
    };
  } catch (error) {
    logger.error("Failed to get initiative issues", {
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

export const getIssueResource: ReadResourceTemplateCallback = async (uri, variables) => {
  const client = getLinearClient();
  try {
    const issue = await client.issue(variables.issueId as string);
    
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(issue, null, 2),
        mimeType: "application/json"
      }]
    };
  } catch (error) {
    logger.error("Failed to get issue", {
      error: error instanceof Error ? error.message : "Unknown error",
      issueId: variables.issueId
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
