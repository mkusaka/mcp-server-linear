import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.linear.app/graphql", () => {
    return HttpResponse.json({
      data: { viewer: { id: "mock-user-id", name: "Mock User" } },
    });
  }),

  http.post("https://api.linear.app/graphql", async ({ request }) => {
    const body = await request.json();
    const { query, variables } = body as {
      query: string;
      variables: Record<string, any>;
    };

    if (query.includes("viewer") || query.includes("Viewer")) {
      return HttpResponse.json({
        data: {
          viewer: {
            id: "mock-user-id",
            name: "Mock User",
            email: "mock.user@example.com",
            teams: {
              nodes: [
                {
                  id: "mock-team-id-1",
                  name: "Team 1",
                  key: "TEAM1",
                },
                {
                  id: "mock-team-id-2",
                  name: "Team 2",
                  key: "TEAM2",
                },
              ],
            },
          },
        },
      });
    }

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

    if (query.includes("issue(id:")) {
      return HttpResponse.json({
        data: {
          issue: {
            id: variables.id || "mock-issue-id",
            title: "Mock Issue",
            description: "Mock Issue Description",
            state: { name: "Todo" },
            comments: {
              nodes: [],
            },
            children: {
              nodes: [],
            },
            parent: null,
            url: "https://linear.app/team/issue/MOCK-123",
            labels: {
              nodes: [
                {
                  id: "mock-label-id",
                  name: "Bug",
                  description: "A bug that needs to be fixed",
                  color: "#FF0000"
                }
              ]
            }
          },
        },
      });
    }

    if (query.includes("mutation") && query.includes("issueCreate")) {
      return HttpResponse.json({
        data: {
          issueCreate: {
            success: true,
            issue: {
              id: "new-mock-issue-id",
              title: variables.input?.title || "New Mock Issue",
              description:
                variables.input?.description || "New Mock Description",
              url: "https://linear.app/team/issue/MOCK-123",
              state: { name: "Todo" },
            },
          },
        },
      });
    }

    if (query.includes("mutation") && query.includes("issueUpdate")) {
      return HttpResponse.json({
        data: {
          issueUpdate: {
            success: true,
            issue: {
              id: variables.id || "mock-issue-id",
              title: variables.input?.title || "Updated Mock Issue",
              description:
                variables.input?.description || "Updated Mock Description",
              url: "https://linear.app/team/issue/MOCK-123",
              state: { name: "Todo" },
            },
          },
        },
      });
    }

    if (query.includes("mutation") && query.includes("issueDelete")) {
      return HttpResponse.json({
        data: {
          issueDelete: {
            success: true,
            issue: {
              id: variables.id || "mock-issue-id",
            },
          },
        },
      });
    }

    return HttpResponse.json(
      {
        data: null,
        errors: [{ message: "Not implemented in mock" }],
      },
      { status: 200 },
    );
  }),
];
