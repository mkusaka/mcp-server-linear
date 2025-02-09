# Architecture Decision Record

## Context

We need to create a Model Context Protocol (MCP) server that interfaces with the Linear API to provide issue tracking functionality. The server needs to handle various resources like issues, initiatives, and user data while maintaining clean error handling and consistent response formats.

## Decisions

### 1. Resource Organization

**Decision**: Organize resources by domain in separate files
- `resources/issues.ts`: Issue-related resources
- `resources/initiative.ts`: Initiative-related resources
- `resources/viewer.ts`: User/viewer-related resources

**Rationale**:
- Clear separation of concerns
- Easy to locate and maintain related functionality
- Allows for independent evolution of each domain
- Reduces file size and improves readability

### 2. Error Handling

**Decision**: Implement consistent error handling across all resources that returns JSON responses instead of throwing errors

**Implementation**:
- Handle specific error types (`InvalidInputLinearError`, `LinearError`)
- Return structured JSON responses for all error cases
- Include appropriate error messages and types
- Log errors with context for debugging

**Rationale**:
- Provides consistent error handling across the application
- Makes it easier for clients to handle errors programmatically
- Maintains API stability even during errors
- Improves debugging through structured logging

### 3. Resource URI Structure

**Decision**: Implement a clear and consistent URI structure for resources

**Patterns**:
- Single resources: `{domain}://{id}`
  - Example: `issues://{issueId}`
- List resources: `{domain}://list`
  - Example: `initiatives://list`
- Nested resources: `{domain}://{parent}/{parentId}`
  - Example: `issues://project/{projectId}`

**Rationale**:
- Predictable and intuitive URI patterns
- Clear relationship between resources
- Easy to extend for new resource types
- Follows REST-like principles

### 4. Response Format

**Decision**: Use consistent JSON response format across all resources

**Structure**:
```json
{
  "error": string | undefined,
  "message": string | undefined,
  ... resource specific data
}
```

**Rationale**:
- Consistent response structure makes client integration easier
- Clear separation between error and success cases
- Flexible enough to accommodate different resource types
- Easy to extend with additional metadata if needed

### 5. Query Parameters

**Decision**: Support optional query parameters for filtering and customization

**Example**:
- `initiatives://list?teamId=xxx`

**Rationale**:
- Provides flexibility in resource retrieval
- Allows for future extensibility
- Maintains clean URI structure
- Follows common API practices

### 6. Resource and Tool Registration Pattern

**Decision**: Implement a consistent pattern for registering resources and tools in `src/index.ts`

**Implementation**:
```typescript
// Resources
server.resource(
  "resource-name",                                    // Unique identifier
  new ResourceTemplate("domain://{param}", { ... }), // URI template
  { mimeType: "application/json" },                  // Response type
  resourceHandler                                    // Handler function
);

// Tools
server.tool(
  "tool_name",           // Tool identifier
  "Tool description",    // Human readable description
  ToolSchema.shape,      // Zod schema for validation
  toolHandler           // Handler function
);
```

**Organization**:
- Group related resources together (e.g., all issue-related resources)
- Add descriptive comments for each resource/tool
- Maintain consistent ordering (viewer -> domain resources -> tools)
- Keep all registrations in `src/index.ts` for centralized management

**Resource Handler Location**:
- Place resource handlers in `src/resources/{domain}.ts`
- Place tool handlers in `src/tools/{domain}.ts`
- Use domain-based file organization

**Rationale**:
- Centralized registration makes it easy to see all available endpoints
- Consistent pattern makes it easy to add new resources
- Domain-based organization keeps related code together
- Clear separation between resources and tools
- Easy to maintain and scale

## Consequences

### Positive
- Clean and maintainable codebase
- Consistent error handling and response formats
- Easy to extend with new resources
- Clear separation of concerns
- Good debugging capabilities through structured logging

### Negative
- Some code duplication in error handling
- Need to maintain consistency across multiple resource files
- Need to keep URI patterns consistent as system grows

## Future Considerations

1. Consider implementing shared error handling utilities to reduce duplication
2. May need pagination support for list endpoints
3. Consider caching for frequently accessed resources
4. May need rate limiting for API calls
5. Consider implementing batch operations for multiple resources 
