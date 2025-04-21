#!/usr/bin/env node

import { Command } from "commander";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  getIssueResource,
  getProjectIssuesResource,
  getStatusListResource,
} from "./resources/issues.js";
import { getIssueLabelsResource } from "./resources/labels.js";
import {
  getProjectResource,
  getProjectsResource,
} from "./resources/project.js";
import { getViewerResource } from "./resources/viewer.js";
import {
  CreateCommentSchema,
  DeleteCommentSchema,
  GetIssueCommentsSchema,
  UpdateCommentSchema,
} from "./schemas/comments.js";
import {
  CreateIssueSchema,
  DeleteIssueSchema,
  GetIssueLabelsSchema,
  GetIssueSchema,
  GetProjectIssuesSchema,
  GetProjectSchema,
  GetProjectsSchema,
  GetIssueStatusListSchema,
  GetViewerSchema,
  UpdateIssueEstimateSchema,
  UpdateIssueLabelsSchema,
  UpdateIssuePrioritySchema,
  UpdateIssueSchema,
  UpdateIssueStateSchema,
  UpdateProjectStateSchema,
} from "./schemas/issues.js";
import { SearchIssuesSchema } from "./schemas/issueFilters.js";
import {
  createCommentTool,
  deleteCommentTool,
  getIssueCommentsResource,
  updateCommentTool,
} from "./tools/comments.js";
import {
  createIssueTool,
  deleteIssueTool,
  updateIssueEstimateTool,
  updateIssueLabelsTool,
  updateIssuePriorityTool,
  updateIssueStateTool,
  updateIssueTool,
} from "./tools/issues.js";
import { updateProjectStateTool } from "./tools/projects.js";
import { searchIssuesTool } from "./tools/searchIssues.js";
import { logger, configureLogger } from "./utils/logger.js";

const server = new McpServer({
  name: "linear-mcp-server",
  version: "1.0.0",
});

// Define projects list resource
server.tool(
  "projects",
  "Get all projects in Linear",
  GetProjectsSchema.shape,
  getProjectsResource,
);

// Define single project resource
server.tool(
  "project",
  "Get a single project in Linear",
  GetProjectSchema.shape,
  getProjectResource,
);

// Define single issue resource
server.tool(
  "issue",
  "Get a single issue in Linear",
  GetIssueSchema.shape,
  getIssueResource,
);

// Define status list resource
server.tool(
  "status-list",
  "Get all available project statuses in Linear",
  GetIssueStatusListSchema.shape,
  getStatusListResource,
);

// Define project issues resource
server.tool(
  "project-issues",
  "Get all issues in a project in Linear",
  GetProjectIssuesSchema.shape,
  getProjectIssuesResource,
);

// Define issue labels resource
server.tool(
  "issue-labels",
  "Get all issue labels in Linear",
  GetIssueLabelsSchema.shape,
  getIssueLabelsResource,
);

// Define create issue tool
server.tool(
  "create_issue",
  "Create a new issue in Linear",
  CreateIssueSchema.shape,
  createIssueTool,
);

// Define update issue tool
server.tool(
  "update_issue",
  "Update an existing issue in Linear",
  UpdateIssueSchema.shape,
  updateIssueTool,
);

// Define delete issue tool
server.tool(
  "delete_issue",
  "Delete an existing issue in Linear",
  DeleteIssueSchema.shape,
  deleteIssueTool,
);

// Define update issue labels tool
server.tool(
  "update_issue_labels",
  "Update the labels of an existing issue in Linear",
  UpdateIssueLabelsSchema.shape,
  updateIssueLabelsTool,
);

// Define update issue priority tool
server.tool(
  "update_issue_priority",
  "Update the priority of an existing issue in Linear",
  UpdateIssuePrioritySchema.shape,
  updateIssuePriorityTool,
);

// Define update issue estimate tool
server.tool(
  "update_issue_estimate",
  "Update the estimate of an existing issue in Linear",
  UpdateIssueEstimateSchema.shape,
  updateIssueEstimateTool,
);

// Define update issue state tool
server.tool(
  "update_issue_state",
  "Update the state of an existing issue in Linear",
  UpdateIssueStateSchema.shape,
  updateIssueStateTool,
);

// Define update project state tool
server.tool(
  "update_project_state",
  "Update the state of an existing project in Linear",
  UpdateProjectStateSchema.shape,
  updateProjectStateTool,
);

// Define create comment tool
server.tool(
  "create_comment",
  "Create a new comment in Linear",
  CreateCommentSchema.shape,
  createCommentTool,
);

// Define update comment tool
server.tool(
  "update_comment",
  "Update an existing comment in Linear",
  UpdateCommentSchema.shape,
  updateCommentTool,
);

// Define delete comment tool
server.tool(
  "delete_comment",
  "Delete an existing comment in Linear",
  DeleteCommentSchema.shape,
  deleteCommentTool,
);

// Define get issue comments resource
server.tool(
  "get_issue_comments",
  "Get comments for a specific issue in Linear",
  GetIssueCommentsSchema.shape,
  getIssueCommentsResource,
);

// Define get viewer resource with teams
server.tool(
  "get_viewer",
  "Get current user information including teams",
  GetViewerSchema.shape,
  getViewerResource,
);

// Define search issues tool
server.tool(
  "search_issues",
  "Search for issues with advanced filtering options",
  SearchIssuesSchema.shape,
  searchIssuesTool,
);

const program = new Command()
  .name("mcp-server-linear")
  .description("MCP server for using the Linear API")
  .version("1.0.0")
  .option("--debug", "Enable debug mode with logging")
  .option("--log-file <path>", "Specify log file path", "linear-mcp.log");

program.parse();

configureLogger({
  debug: program.opts().debug,
  logFile: program.opts().logFile,
});

async function runServer() {
  logger.info("Starting Linear MCP Server", {
    nodeEnv: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Linear MCP Server running on stdio");
}

runServer().catch((error) => {
  logger.error("Fatal error in main():", error);
  process.exit(1);
});
