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

## Configuration

### Linear API Authentication

This server supports two authentication methods:

#### Option 1: API Key Authentication

You can set up the `LINEAR_API_KEY` environment variable:

1. Go to [Linear Settings > API](https://linear.app/settings/api)
2. Under "Personal API keys", click "Create key"
3. Give your key a name (e.g., "MCP Server")
4. Copy the generated API key
5. Set the environment variable when running the server:

```bash
LINEAR_API_KEY=your_api_key_here pnpm run debug
```

#### Option 2: OAuth Authentication

Alternatively, you can use OAuth authentication by setting the following environment variables:

1. Create an OAuth application at [Linear Settings > API > Applications](https://linear.app/settings/api/applications)
2. Configure your application and obtain the client ID and client secret
3. Set the following environment variables:

```bash
LINEAR_OAUTH_CLIENT_ID=your_oauth_client_id
LINEAR_OAUTH_CLIENT_SECRET=your_oauth_client_secret
```

If both authentication methods are configured, OAuth authentication will be prioritized.

Alternatively, you can set the environment variables in your shell profile or use a tool like `dotenv`.

## Usage

### Starting the Server

For development and testing, you can use the built-in inspector:

```bash
pnpm run debug
```

#### Command Line Options

```bash
# Enable logging (logs to linear-mcp.log by default)
pnpm run start -- --debug

# Enable logging with custom log file path
pnpm run start -- --debug --log-file custom-path.log
```

### Integration with MCP Clients

This MCP server can be integrated with various AI assistants and MCP-compatible clients:

#### Running with npx

You can run the MCP server directly using npx without installing it globally:

```bash
LINEAR_API_KEY=your_api_key_here npx -y @mkusaka/mcp-server-linear
```

#### MCP Inspector

For development and testing, you can use the MCP Inspector to interact with the server:

```bash
# Install the MCP Inspector globally
pnpm install -g @modelcontextprotocol/inspector

# Run the server with the inspector
LINEAR_API_KEY=your_api_key_here mcp-inspector /path/to/mcp-server-linear/dist/index.js

# Or using npx
LINEAR_API_KEY=your_api_key_here npx -y @modelcontextprotocol/inspector @mkusaka/mcp-server-linear
```

#### Anthropic Claude Integration

You can use this MCP server with Anthropic Claude through various clients:

##### Cline (VS Code Extension)

[Cline](https://github.com/saoudrizwan/cline) is a VS Code extension that allows you to use MCP servers with Claude AI:

1. Open your Cline MCP settings file:
   - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Windows: `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. Add the Linear MCP server configuration:

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@mkusaka/mcp-server-linear"],
      "env": {
        "LINEAR_API_KEY": "your_linear_api_key"
        // or when using OAuth authentication
        // "LINEAR_OAUTH_CLIENT_ID": "your_oauth_client_id",
        // "LINEAR_OAUTH_CLIENT_SECRET": "your_oauth_client_secret"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

##### Cursor

Add the following to your Cursor configuration file (`~/.cursor/config.json`):

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@mkusaka/mcp-server-linear"],
      "env": {
        "LINEAR_API_KEY": "your_linear_api_key"
        // or when using OAuth authentication
        // "LINEAR_OAUTH_CLIENT_ID": "your_oauth_client_id",
        // "LINEAR_OAUTH_CLIENT_SECRET": "your_oauth_client_secret"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

##### Claude API

You can also use this MCP server directly with the Claude API that supports MCP. Configure your application to connect to the MCP server and provide the necessary authentication details.

### Available Tools

This MCP server provides the following tools:

#### Issue Management

- `create_issue` - Create a new issue in Linear
- `update_issue` - Update an existing issue
- `delete_issue` - Delete an existing issue
- `update_issue_labels` - Update the labels of an issue
- `update_issue_priority` - Update the priority of an issue
- `update_issue_estimate` - Update the estimate of an issue
- `update_issue_state` - Update the state of an issue
- `search_issues` - Search for issues with advanced filtering options

#### Comment Management

- `create_comment` - Create a new comment on an issue
- `update_comment` - Update an existing comment
- `delete_comment` - Delete an existing comment
- `get_issue_comments` - Get comments for a specific issue

#### Resource Access

- `projects` - Get all projects in Linear
- `project` - Get a single project by ID
- `issue` - Get a single issue by ID
- `project_statuses` - Get all project statuses
- `project_issues` - Get all issues in a project
- `issue_labels` - Get all issue labels
- `issue_states` - Get all available issue states
- `get_viewer` - Get current user information including teams
- `update_project_state` - Update the state of a project

## Architecture

This server follows the Model Context Protocol (MCP) architecture to provide a standardized way to access Linear resources. Key architectural decisions include:

1. **Resource Organization**: Resources are organized by domain in separate files
2. **Error Handling**: Consistent error handling across all resources
3. **Response Format**: Consistent JSON response format

For more detailed information about the architecture, see [adr.md](adr.md).

## Development

```bash
# Run tests
pnpm test

# Build the project
pnpm run build

# Watch for changes
pnpm run watch

# Run with inspector
pnpm run debug
```

## Contributing

Contributions are welcome! See [adr.md](adr.md) for architecture decisions and project structure.

## License

MIT
