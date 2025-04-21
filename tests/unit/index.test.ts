import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => {
  return {
    McpServer: vi.fn().mockImplementation(() => ({
      tool: vi.fn(),
      connect: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => {
  return {
    StdioServerTransport: vi.fn().mockImplementation(() => ({})),
  };
});

vi.mock("../../src/resources/issues.js", () => ({
  getIssueResource: vi.fn(),
  getProjectIssuesResource: vi.fn(),
  getStatusListResource: vi.fn(),
}));

vi.mock("../../src/resources/labels.js", () => ({
  getIssueLabelsResource: vi.fn(),
}));

vi.mock("../../src/resources/project.js", () => ({
  getProjectResource: vi.fn(),
  getProjectsResource: vi.fn(),
}));

vi.mock("../../src/resources/viewer.js", () => ({
  getViewerResource: vi.fn(),
}));

vi.mock("../../src/tools/comments.js", () => ({
  createCommentTool: vi.fn(),
  deleteCommentTool: vi.fn(),
  getIssueCommentsResource: vi.fn(),
  updateCommentTool: vi.fn(),
}));

vi.mock("../../src/tools/issues.js", () => ({
  createIssueTool: vi.fn(),
  deleteIssueTool: vi.fn(),
  updateIssueEstimateTool: vi.fn(),
  updateIssueLabelsTool: vi.fn(),
  updateIssuePriorityTool: vi.fn(),
  updateIssueStateTool: vi.fn(),
  updateIssueTool: vi.fn(),
}));

vi.mock("../../src/tools/searchIssues.js", () => ({
  searchIssuesTool: vi.fn(),
}));

vi.mock("../../src/utils/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
  configureLogger: vi.fn(),
}));

vi.mock("commander", () => {
  const mockCommand = {
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    option: vi.fn().mockReturnThis(),
    parse: vi.fn(),
    opts: vi.fn().mockReturnValue({
      debug: false,
      logFile: "test.log",
    }),
  };

  return {
    Command: vi.fn().mockImplementation(() => mockCommand),
  };
});

describe("Server Initialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("should initialize the MCP server with all tools", async () => {
    await import("../../src/index.js");

    expect(McpServer).toHaveBeenCalledWith(
      {
        name: "linear-mcp-server",
        version: "1.0.0",
      },
      expect.any(Object),
    );

    const mockServer = (McpServer as any).mock.results[0].value;

    expect(mockServer.tool).toHaveBeenCalledTimes(20);

    expect(StdioServerTransport).toHaveBeenCalled();

    expect(mockServer.connect).toHaveBeenCalledWith(expect.any(Object));
  });

  it("should handle errors during server startup", async () => {
    const mockConnect = vi
      .fn()
      .mockRejectedValue(new Error("Connection error"));
    vi.mocked(McpServer).mockImplementation(
      () =>
        ({
          tool: vi.fn(),
          connect: mockConnect,
          server: {} as any,
          _registeredResources: {} as any,
          _registeredResourceTemplates: {} as any,
          _registeredTools: {} as any,
        }) as any,
    );

    const mockExit = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as any);

    await import("../../src/index.js");

    await new Promise((resolve) => setTimeout(resolve, 0));

    const { logger } = await import("../../src/utils/logger.js");
    expect(logger.error).toHaveBeenCalledWith(
      "Fatal error in main():",
      expect.any(Error),
    );
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
  });
});
