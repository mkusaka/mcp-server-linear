#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Command } from "commander";
import {
  getIssueResource,
  getIssueStatesResource,
  getProjectIssuesResource,
  getProjectStatusesResource,
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
import { SearchIssuesSchema } from "./schemas/issueFilters.js";
import {
  CreateIssueSchema,
  DeleteIssueSchema,
  GetIssueLabelsSchema,
  GetIssueSchema,
  GetIssueStatesSchema,
  GetProjectIssuesSchema,
  GetProjectSchema,
  GetProjectsSchema,
  GetProjectStatusesSchema,
  GetViewerSchema,
  UpdateIssueEstimateSchema,
  UpdateIssueLabelsSchema,
  UpdateIssuePrioritySchema,
  UpdateIssueSchema,
  UpdateIssueStateSchema,
  UpdateProjectStateSchema,
} from "./schemas/issues.js";
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
import { configureLogger, logger } from "./utils/logger.js";

const server = new McpServer(
  {
    name: "linear-mcp-server",
    version: "1.0.0",
  },
  {
    instructions: `This MCP server enables AI assistants to interact with Linear issue tracking system directly.

Capabilities:
1. Retrieve detailed information about issues, projects, teams, and users in Linear
2. Create and update issues with customizable fields (title, description, priority, etc.)
3. Add and manage comments on issues for collaborative discussions
4. Track project progress through state changes and team workload analysis
5. Search and filter issues across projects using flexible criteria
6. Update issue details including labels, priority, state, and estimates
7. Manage project states and monitor team activities

When to use Linear MCP tools:
- During project planning to create and organize new issues
- In development discussions to reference or update existing issues
- During code reviews to link discussions to specific Linear issues
- In sprint planning to assess team workload and resource allocation
- When documenting bugs or feature requests discovered during conversations
- During project status reviews to track progress and update stakeholders

Interaction Protocol:
When working with Linear resources, follow these steps:
1. Identify the Linear-related request or information need
2. Select the appropriate tool based on the operation required:
   - Use resource retrieval tools for getting information (issues, projects, etc.)
   - Use creation/update tools for modifying Linear data
   - Use search tools for finding specific issues across projects
3. Format the request with required parameters following the tool's schema
4. Process the response and present the information in a contextually appropriate format

Example Interactions:

Example 1: Creating a new issue
User: "I need to create a task for implementing user authentication"
Assistant: "I'll create that issue for you. What project should I add it to?"
User: "Add it to the Backend project"
Assistant: *Creates issue in Linear using create_issue tool with appropriate parameters*
Assistant: "I've created the issue 'Implement user authentication' in the Backend project. Here's the link: [BACK-123]"

Example 2: Retrieving issue information
User: "What's the status of BACK-123?"
Assistant: *Retrieves issue information using the issue tool*
Assistant: "The issue 'Implement user authentication' (BACK-123) is currently in the 'In Progress' state and is assigned to Alex with high priority."

Example 3: Searching for issues
User: "Show me all high priority bugs in the Frontend project"
Assistant: *Uses search_issues tool with appropriate filters*
Assistant: "I found 3 high priority bugs in the Frontend project:
1. 'Fix login page CSS' (FRONT-42)
2. 'Address accessibility issues in navigation' (FRONT-45)
3. 'Fix image loading performance' (FRONT-51)"

Guidelines for Effective Usage:
- Always verify you have sufficient information before creating or updating Linear resources
- Present Linear data in a structured, easy-to-understand format
- When creating new issues, ensure proper categorization with appropriate labels and projects
- Use precise search filters to retrieve relevant issues and avoid overwhelming results
- Maintain conversational context when working with Linear resources across multiple exchanges
- Format Linear URLs consistently and provide direct links when referencing specific resources`,
  },
);

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

// Define project statuses resource
server.tool(
  "project_statuses",
  "Get all available project statuses in Linear",
  GetProjectStatusesSchema.shape,
  getProjectStatusesResource,
);

// Define issue states resource
server.tool(
  "issue-states",
  "Get all available issue states (workflow states) in Linear",
  GetIssueStatesSchema.shape,
  getIssueStatesResource,
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

// Define update project state tool
server.tool(
  "update_project_state",
  "Update the state of an existing project in Linear",
  UpdateProjectStateSchema.shape,
  updateProjectStateTool,
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
