# mcp-server-linear

Model Context Protocol (MCP) server for interacting with the Linear API. This server provides tools and resources for accessing and manipulating Linear issues, projects, and other data through a standardized MCP interface.

## Overview

The `mcp-server-linear` project serves as a bridge between client applications (particularly AI assistants and other tools) and Linear, providing a standardized interface for accessing and manipulating Linear resources. Clients can retrieve information about issues, projects, and labels, as well as create, update, and delete issues and comments.

Key features:
- Retrieve Linear resources (issues, projects, labels, comments)
- Create, update, and delete issues
- Create, update, and delete comments
- Manage issue labels, priority, estimates, and states
- Consistent error handling and response formats

## Installation

### From npm package

```bash
# Install from npm
npm install @U06CKH0PYQP/mcp-server-linear

# Or using yarn
yarn add @U06CKH0PYQP/mcp-server-linear

# Or using pnpm
pnpm add @U06CKH0PYQP/mcp-server-linear
```

### From source

```bash
# Clone the repository
git clone https://github.com/mkusaka/mcp-server-linear.git
cd mcp-server-linear

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Linear API Authentication

This server requires a Linear API key to authenticate with the Linear API. You need to set up the `LINEAR_API_KEY` environment variable:

1. Go to [Linear Settings > API](https://linear.app/settings/api)
2. Under "Personal API keys", click "Create key"
3. Give your key a name (e.g., "MCP Server")
4. Copy the generated API key
5. Set the environment variable when running the server:

```bash
LINEAR_API_KEY=your_api_key_here npm run debug
```

Alternatively, you can set the environment variable in your shell profile or use a tool like `dotenv`.

## Usage

### Starting the Server

For development and testing, you can use the built-in inspector:

```bash
npm run debug
```

### Using with MCP Clients

The server exposes various tools and resources over MCP that can be consumed by compatible clients:

#### Available Tools

Issue Management:
- `create_issue` - Create a new issue in Linear
- `update_issue` - Update an existing issue
- `delete_issue` - Delete an existing issue
- `update_issue_labels` - Update the labels of an issue
- `update_issue_priority` - Update the priority of an issue
- `update_issue_estimate` - Update the estimate of an issue
- `update_issue_state` - Update the state of an issue

Comment Management:
- `create_comment` - Create a new comment on an issue
- `update_comment` - Update an existing comment
- `delete_comment` - Delete an existing comment
- `get_issue_comments` - Get comments for a specific issue

Resource Access:
- `projects` - Get all projects in Linear
- `project` - Get a single project by ID
- `issue` - Get a single issue by ID
- `project-statuses` - Get all project statuses
- `project-issues` - Get all issues in a project
- `issue-labels` - Get all issue labels

## Architecture

This server follows the Model Context Protocol (MCP) architecture to provide a standardized way to access Linear resources. Key architectural decisions include:

1. **Resource Organization**: Resources are organized by domain in separate files
2. **Error Handling**: Consistent error handling across all resources
3. **Resource URI Structure**: Clear and consistent URI structure for resources
4. **Response Format**: Consistent JSON response format

For more detailed information about the architecture, see [adr.md](adr.md).

### Resource URI Patterns

- Single resources: `{domain}://{id}`
  - Example: `issues://{issueId}`
- List resources: `{domain}://list`
  - Example: `projects://list`
- Nested resources: `{domain}://{parent}/{parentId}`
  - Example: `issues://project/{projectId}`

## API Reference

### Issues

#### Create Issue

Create a new issue in Linear.

```typescript
// Tool name: create_issue
{
  title: string;       // Issue title (required)
  description?: string; // Issue description
  teamId: string;      // Target team ID (required)
  projectId?: string;  // Target project ID
  parentId?: string;   // Parent issue ID
  dependencyIds?: string[]; // Dependency issue IDs
  labels?: string[];   // Issue labels
  estimate?: number;   // Issue estimate
  priority?: "low" | "medium" | "high"; // Issue priority
}
```

#### Update Issue

Update an existing issue in Linear.

```typescript
// Tool name: update_issue
{
  issueId: string;     // Target issue ID (required)
  title?: string;      // Issue title
  description?: string; // Issue description
}
```

#### Delete Issue

Delete an existing issue in Linear.

```typescript
// Tool name: delete_issue
{
  issueId: string;     // Target issue ID (required)
}
```

### Comments

#### Create Comment

Create a new comment on an issue in Linear.

```typescript
// Tool name: create_comment
{
  issueId: string;     // Target issue ID (required)
  body: string;        // Comment body (required)
}
```

### Projects

#### Get Project

Get a single project in Linear.

```typescript
// Tool name: project
{
  projectId: string;   // Target project ID (required)
}
```

#### Get Project Issues

Get all issues in a project in Linear.

```typescript
// Tool name: project-issues
{
  projectId: string;   // Target project ID (required)
}
```

## Development

```bash
# Run tests
npm test

# Build the project
npm run build

# Watch for changes
npm run watch

# Run with inspector
npm run debug
```

## Contributing

Contributions are welcome! See [adr.md](adr.md) for architecture decisions and project structure.

## License

ISC
