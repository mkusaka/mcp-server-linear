#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getViewerResource } from "./resources/viewer.js";
import { getProjectIssuesResource, getInitiativeIssuesResource, getIssueResource } from "./resources/issues.js";
import { getInitiativesResource, getInitiativeResource } from "./resources/initiative.js";
import { getProjectsResource, getProjectResource } from "./resources/project.js";
import { CreateIssueSchema } from "./schemas/issues.js";
import { createIssueTool } from "./tools/issues.js";
import { logger } from "./utils/logger.js";

const server = new McpServer({
  name: "linear-mcp-server",
  version: "1.0.0"
});

// Define viewer resource
server.resource(
  "viewer",
  "viewer://me",
  { mimeType: "application/json" },
  getViewerResource
);

// Define projects list resource
server.resource(
  "projects",
  "projects://list",
  { mimeType: "application/json" },
  getProjectsResource
);

// Define single project resource
server.resource(
  "project",
  new ResourceTemplate("projects://{projectId}", { list: undefined }),
  { mimeType: "application/json" },
  getProjectResource
);

// Define initiatives list resource
server.resource(
  "initiatives",
  "initiatives://list",
  { mimeType: "application/json" },
  getInitiativesResource
);

// Define single initiative resource
server.resource(
  "initiative",
  new ResourceTemplate("initiatives://{initiativeId}", { list: undefined }),
  { mimeType: "application/json" },
  getInitiativeResource
);

// Define single issue resource
server.resource(
  "issue",
  new ResourceTemplate("issues://{issueId}", { list: undefined }),
  { mimeType: "application/json" },
  getIssueResource
);

// Define project issues resource
server.resource(
  "project-issues",
  new ResourceTemplate("issues://project/{projectId}", { list: undefined }),
  { mimeType: "application/json" },
  getProjectIssuesResource
);

// Define initiative issues resource
server.resource(
  "initiative-issues",
  new ResourceTemplate("issues://initiative/{initiativeId}", { list: undefined }),
  { mimeType: "application/json" },
  getInitiativeIssuesResource
);

// Define create issue tool
server.tool(
  "create_issue",
  "Create a new issue in Linear",
  CreateIssueSchema.shape,
  createIssueTool
);

async function runServer() {
  logger.info("Starting Linear MCP Server", {
    nodeEnv: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform
  });
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Linear MCP Server running on stdio");
}

runServer().catch((error) => {
  logger.error("Fatal error in main():", error);
  process.exit(1);
}); 
