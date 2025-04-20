import { vi } from "vitest";

const mockIssues = {
  nodes: [
    {
      id: "test-issue-1",
      title: "Test Issue 1",
      description: "Test Description 1",
      state: { name: "Todo" },
    },
    {
      id: "test-issue-2",
      title: "Test Issue 2",
      description: "Test Description 2",
      state: { name: "In Progress" },
    },
  ],
};

const mockProject = {
  id: "test-project-id",
  name: "Test Project",
  issues: () => Promise.resolve(mockIssues),
};

const mockInitiative = {
  id: "test-initiative-id",
  name: "Test Initiative",
  projects: () =>
    Promise.resolve({
      nodes: [
        {
          id: "test-project-1",
          name: "Test Project 1",
          issues: () => Promise.resolve(mockIssues),
        },
      ],
    }),
};

const mockIssue = {
  id: "test-issue-id",
  title: "Test Issue",
  description: "Test Description",
  state: { name: "Todo" },
};

export const mockLinearClient = {
  project: vi.fn().mockImplementation(() => Promise.resolve(mockProject)),
  initiative: vi.fn().mockImplementation(() => Promise.resolve(mockInitiative)),
  issue: vi.fn().mockImplementation(() => Promise.resolve(mockIssue)),
};

vi.mock("@linear/sdk", () => ({
  LinearClient: vi.fn().mockImplementation(() => mockLinearClient),
}));
