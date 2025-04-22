# Testing Strategy for mcp-server-linear

This document outlines the testing strategy for the mcp-server-linear project, which serves as a bridge between client applications and Linear's API using the Model Context Protocol (MCP).

## Overview

The testing approach for this project focuses on:

1. **Unit Testing** - Testing individual components in isolation
2. **Mock-based Testing** - Using MSW to mock Linear's GraphQL API
3. **Comprehensive Coverage** - Testing both resource handlers and tool handlers

## Test Setup

### MSW for GraphQL Mocking

We use [Mock Service Worker (MSW)](https://mswjs.io/) to intercept and mock HTTP requests to the Linear GraphQL API. This allows us to test our code without making actual API calls, providing a consistent and controlled testing environment.

MSW is particularly well-suited for GraphQL APIs as it allows us to:

- Mock specific GraphQL operations (queries and mutations)
- Return structured data that matches the GraphQL schema
- Test error scenarios and edge cases

### Setup Configuration

The test setup is defined in `tests/setup.ts`:

```typescript
import { beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";

const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});
```

This configuration:

1. Creates an MSW server with our defined handlers
2. Starts the server before all tests
3. Closes the server after all tests
4. Resets handlers after each test to ensure isolation

## GraphQL Mock Handlers

The mock handlers in `tests/mocks/handlers.ts` define how MSW should respond to different GraphQL operations. Here's how we leverage MSW's GraphQL support:

```typescript
import { http, HttpResponse } from "msw";

export const handlers = [
  // Handle GET requests to the GraphQL endpoint
  http.get("https://api.linear.app/graphql", () => {
    return HttpResponse.json({
      data: { viewer: { id: "mock-user-id", name: "Mock User" } },
    });
  }),

  // Handle POST requests to the GraphQL endpoint (most operations)
  http.post("https://api.linear.app/graphql", async ({ request }) => {
    const body = await request.json();
    const { query, variables } = body as {
      query: string;
      variables: Record<string, any>;
    };

    // Check the GraphQL query to determine the appropriate response
    if (query.includes("project(id:")) {
      return HttpResponse.json({
        data: {
          project: {
            id: variables.id || "mock-project-id",
            name: "Mock Project",
            description: "Mock Project Description",
            state: "started",
            issues: {
              nodes: [
                {
                  id: "mock-issue-1",
                  title: "Mock Issue 1",
                  description: "Mock Issue 1 Description",
                  state: { name: "Todo" },
                },
                {
                  id: "mock-issue-2",
                  title: "Mock Issue 2",
                  description: "Mock Issue 2 Description",
                  state: { name: "In Progress" },
                },
              ],
            },
          },
        },
      });
    }

    // Handle other GraphQL operations...
  }),
];
```

### Advanced GraphQL Mocking

For more complex applications, MSW provides a dedicated GraphQL API that can be used instead of the HTTP API:

```typescript
import { graphql } from "msw";

export const handlers = [
  graphql.query("GetProject", (req, res, ctx) => {
    const { id } = req.variables;

    return res(
      ctx.data({
        project: {
          id: id || "mock-project-id",
          name: "Mock Project",
          // ...other fields
        },
      }),
    );
  }),

  graphql.mutation("CreateIssue", (req, res, ctx) => {
    const { input } = req.variables;

    return res(
      ctx.data({
        issueCreate: {
          success: true,
          issue: {
            id: "new-mock-issue-id",
            title: input.title,
            description: input.description,
            // ...other fields
          },
        },
      }),
    );
  }),
];
```

This approach allows for more precise matching of GraphQL operations by operation name rather than string matching in the query.

## Testing Resource Handlers

Resource handlers are responsible for retrieving data from Linear. Here's an example of how we test them:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import {
  getProjectIssuesResource,
  getIssueResource,
} from "../../src/resources/issues.js";
import { resetLinearClient } from "../../src/utils/linear.js";

describe("Resource Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    resetLinearClient();
  });

  describe("getProjectIssuesResource", () => {
    it("should return project issues", async () => {
      const result = await getProjectIssuesResource(
        {
          projectId: "mock-project-id",
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      const contentItem = result.content[0];
      if (contentItem.type === "text") {
        const data = JSON.parse(contentItem.text);
        expect(typeof data).toBe("object");
      } else if (contentItem.type === "resource") {
        const resource = contentItem.resource;
        expect(resource.uri).toBe("issues://projects/mock-project-id/issues");
        expect(typeof resource.text).toBe("string");
      }
    });
  });

  // Additional tests...
});
```

## Testing Tool Handlers

Tool handlers are responsible for performing actions in Linear, such as creating or updating issues. Here's how we test them:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createIssueTool,
  updateIssueTool,
  deleteIssueTool,
} from "../../src/tools/issues.js";
import { resetLinearClient } from "../../src/utils/linear.js";

describe("Tool Handlers", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = "TEST_MODE";
    resetLinearClient();

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("createIssueTool", () => {
    it("should attempt to create a new issue", async () => {
      const result = await createIssueTool(
        {
          title: "Test Issue",
          description: "Test Description",
          teamId: "test-team-id",
        },
        { auth: { apiKey: process.env.LINEAR_API_KEY } } as any,
      );

      expect(result).toBeDefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");

      expect(typeof result.content[0].text).toBe("string");
    });
  });

  // Additional tests...
});
```

## Best Practices

### 1. Avoid Hardcoded Secrets

Never include actual API keys or tokens in test files. Use environment variables or non-sensitive placeholders:

```typescript
// Good
process.env.LINEAR_API_KEY = "TEST_MODE";

// Bad
process.env.LINEAR_API_KEY = "actual-api-key-here";
```

### 2. Test Structure

Follow a consistent structure for tests:

- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Set up test prerequisites in `beforeEach`
- Test one specific behavior per test case

### 3. Mock Response Structure

Ensure mock responses match the structure of actual Linear API responses:

- Include all required fields
- Use realistic data types
- Consider edge cases (empty arrays, null values, etc.)

### 4. Error Handling

Test both success and error scenarios:

```typescript
it("should handle API errors gracefully", async () => {
  // Setup MSW to return an error for this specific test
  server.use(
    http.post("https://api.linear.app/graphql", () => {
      return HttpResponse.json(
        {
          errors: [{ message: "Something went wrong" }],
        },
        { status: 200 },
      );
    }),
  );

  // Test that the handler properly handles the error
  const result = await someHandler(params, context);

  expect(result.error).toBeDefined();
  expect(result.error.message).toContain("Something went wrong");
});
```

## End-to-End Testing with SDK Approach

In addition to unit testing with MSW, we can implement end-to-end (E2E) testing using the MCP SDK's `Client` and `InMemoryTransport`. This approach allows us to test the server logic directly in memory without spawning separate processes or dealing with stdio communication.

### Setup for SDK-based E2E Testing

```typescript
import { describe, test, beforeEach, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import {
  ListToolsResultSchema,
  CallToolResultSchema,
  GetPromptResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createServer } from "../../src/server.js"; // server factory function

describe("MCP Server E2E (in‐memory)", () => {
  let mcpServer: ReturnType<typeof createServer>;
  let client: Client;
  let clientTransport: ReturnType<typeof InMemoryTransport.createLinkedPair>[0];
  let serverTransport: ReturnType<typeof InMemoryTransport.createLinkedPair>[1];

  beforeEach(async () => {
    // instantiate the server (register resources/prompts/tools)
    mcpServer = createServer();

    client = new Client({ name: "test client", version: "1.0" });
    [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // connect both sides
    await Promise.all([
      mcpServer.server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
  });

  // Test cases will go here
});
```

### Testing Server Functionality

With the SDK approach, we can test various server functionalities:

#### 1. Listing Available Tools

```typescript
test("tools/list returns all tools", async () => {
  const res = await client.request(
    { method: "tools/list", params: {} },
    ListToolsResultSchema,
  );
  expect(Array.isArray(res.tools)).toBe(true);
  // Optionally check names, count, etc.
});
```

#### 2. Calling Tools with Arguments

```typescript
test("tools/call works", async () => {
  const res = await client.request(
    {
      method: "tools/call",
      params: {
        name: "createIssue",
        arguments: {
          title: "Test Issue",
          description: "Test Description",
          teamId: "test-team-id",
        },
      },
    },
    CallToolResultSchema,
  );
  expect(res.content[0].type).toBe("text");
  // Verify the response content
});
```

#### 3. Getting Prompts with Arguments

```typescript
test("prompts/get works", async () => {
  const res = await client.request(
    {
      method: "prompts/get",
      params: { name: "examplePrompt", arguments: { param: "value" } },
    },
    GetPromptResultSchema,
  );
  expect(res.messages[0].content.text).toContain("expected text");
});
```

### Benefits of SDK-based E2E Testing

1. **Faster Execution** - Tests run in-memory without process spawning overhead
2. **Simplified Setup** - No need to manage stdio or JSON-RPC communication
3. **Type Safety** - Leverages TypeScript types from the SDK
4. **Direct Access** - Can directly inspect server state if needed
5. **Easier Debugging** - Simpler stack traces and error handling

### When to Use SDK-based E2E Testing

SDK-based E2E testing is ideal for:

- Testing core server logic without transport concerns
- Rapid development and iteration
- Testing complex interactions between components
- Scenarios where you need to verify the entire request-response cycle

## Future Improvements

1. **Increase Test Coverage** - Add tests for additional resources and tools
2. **Integration Tests** - Add tests that verify multiple components working together
3. **Snapshot Testing** - Use snapshot testing for complex response structures
4. **Test Helpers** - Create helper functions to reduce test boilerplate
5. **Combined Testing Approach** - Implement both MSW-based unit tests and SDK-based E2E tests

## Running Tests

Tests can be run using the following command:

```bash
pnpm test
```

For watching mode during development:

```bash
pnpm test -- --watch
```

## Conclusion

This testing strategy provides a solid foundation for ensuring the reliability and correctness of the mcp-server-linear project. By using MSW to mock the Linear GraphQL API, we can test our code in isolation while still verifying that it correctly interacts with the API.
