# mcp-server-linear

Model Context Protocol (MCP) server for interacting with the Linear API. This server provides tools and resources for accessing and manipulating Linear issues, projects, and other data through a standardized MCP interface.

## Overview

The `mcp-server-linear` project serves as a bridge between client applications (particularly AI assistants and other tools) and Linear, providing a standardized interface for accessing and manipulating Linear resources. Clients can retrieve information about issues, projects, and labels, as well as create, update, and delete issues and comments.

Key features:

- Retrieve Linear resources (issues, projects, labels, comments)
- Create, update, and delete issues
- Create, update, and delete comments
- Manage issue labels, priority, estimates, and states
- Advanced issue searching with flexible filtering options
- Consistent error handling and response formats

## Installation

### From npm package

```bash
# Install from npm
npm install @mkusaka/mcp-server-linear

# Or using yarn
yarn add @mkusaka/mcp-server-linear

# Or using pnpm
pnpm add @mkusaka/mcp-server-linear
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

### Integration with MCP Tools

#### Cline Integration

[Cline](https://github.com/saoudrizwan/cline) is a VS Code extension that allows you to use MCP servers with Claude AI. To set up this MCP server with Cline:

1. Open your Cline MCP settings file:

   - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Windows: `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. Add the Linear MCP server configuration:

   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "node",
         "args": ["/path/to/mcp-server-linear/dist/index.js"],
         "env": {
           "LINEAR_API_KEY": "your_linear_api_key"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

   Alternatively, you can use npx to run the package directly:

   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["-y", "@mkusaka/mcp-server-linear"],
         "env": {
           "LINEAR_API_KEY": "your_linear_api_key"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

#### Running with npx

You can run the MCP server directly using npx without installing it globally:

```bash
LINEAR_API_KEY=your_api_key_here npx -y @mkusaka/mcp-server-linear
```

#### MCP Inspector

For development and testing, you can use the MCP Inspector to interact with the server:

1. Install the MCP Inspector globally:

   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. Run the server with the inspector:

   ```bash
   LINEAR_API_KEY=your_api_key_here mcp-inspector /path/to/mcp-server-linear/dist/index.js
   ```

   Or using npx:

   ```bash
   LINEAR_API_KEY=your_api_key_here npx -y @modelcontextprotocol/inspector @mkusaka/mcp-server-linear
   ```

#### Cursor Configuration

Add the following to your Cursor configuration file (`~/.cursor/config.json`):

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@mkusaka/mcp-server-linear"],
      "env": {
        "LINEAR_API_KEY": "your_linear_api_key"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

#### Anthropic Claude Integration

You can use this MCP server with Anthropic Claude through compatible clients like Cline or directly through the Claude API with MCP support.

#### Rule Configuration

Add the following to your AI assistant's rules or prompt:

```
You have Linear MCP tools at your disposal. Follow these rules regarding Linear tool usage:
1. ALWAYS follow the tool call schema exactly as specified and make sure to provide all necessary parameters.
2. When I share a Linear URL (like https://linear.app/company/issue/ABC-123), automatically use the appropriate Linear tool to fetch information about that resource.
3. **NEVER refer to tool names when speaking to me.** For example, instead of saying 'I need to use the Linear MCP tool to fetch this issue', just say 'I'll get the details of that issue for you'.
4. Only use Linear tools when they are necessary. If my task is general or you already know the answer, just respond without calling tools.
5. When I mention Linear issues, projects, or initiatives, use the appropriate tools to:
   - Retrieve information about the mentioned resources
   - Create new issues when requested
   - Search for related issues or projects
   - Provide context about Linear resources mentioned in our conversation
```

#### Other MCP Clients

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
- `search_issues` - Search for issues with advanced filtering options

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
  issueId: string; // Target issue ID (required)
}
```

#### Search Issues

Search for issues with advanced filtering options.

```typescript
// Tool name: search_issues
{
  filter?: {
    // Free text search across issue title and description
    search?: string;
    
    // Filter by issue properties
    title?: { contains?: string, eq?: string, /* other string comparators */ };
    description?: { contains?: string, /* other string comparators */ };
    priority?: { eq?: number, gte?: number, /* other number comparators */ };
    
    // Filter by related entities
    team?: { id?: { eq?: string }, name?: { eq?: string } };
    assignee?: { id?: { eq?: string }, name?: { eq?: string } };
    state?: { id?: { eq?: string }, name?: { eq?: string }, type?: { eq?: string } };
    
    // Date filters
    createdAt?: { gt?: string, lt?: string, /* other date comparators */ };
    updatedAt?: { gt?: string, lt?: string, /* other date comparators */ };
    
    // Logical operators
    and?: Array</* nested filter objects */>;
    or?: Array</* nested filter objects */>;
    not?: /* nested filter object */;
  };
  first?: number; // Number of issues to return (default: 50)
  after?: string; // Cursor for pagination
  orderBy?: "createdAt" | "updatedAt" | "priority" | "title"; // Field to order results by (default: "updatedAt")
  orderDirection?: "ASC" | "DESC"; // Direction to order results (default: "DESC")
}
```

Example filters:

```typescript
// Search for issues with "bug" in the title
{
  filter: {
    title: {
      contains: "bug"
    }
  }
}

// Search for high priority issues assigned to a specific user
{
  filter: {
    and: [
      {
        priority: {
          gte: 3
        }
      },
      {
        assignee: {
          email: {
            eq: "user@example.com"
          }
        }
      }
    ]
  }
}

// Search for issues created in the last 7 days
{
  filter: {
    createdAt: {
      gt: "2023-04-13T00:00:00Z" // Replace with dynamic date calculation
    }
  }
}
```

### Comments

#### Create Comment

Create a new comment on an issue in Linear.

```typescript
// Tool name: create_comment
{
  issueId: string; // Target issue ID (required)
  body: string; // Comment body (required)
}
```

### Projects

#### Get Project

Get a single project in Linear.

```typescript
// Tool name: project
{
  projectId: string; // Target project ID (required)
}
```

#### Get Project Issues

Get all issues in a project in Linear.

```typescript
// Tool name: project-issues
{
  projectId: string; // Target project ID (required)
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
