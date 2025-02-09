import { http } from 'msw'

const mockIssues = {
  nodes: [
    {
      id: 'test-issue-1',
      title: 'Test Issue 1',
      description: 'Test Description 1',
      state: { name: 'Todo' }
    },
    {
      id: 'test-issue-2',
      title: 'Test Issue 2',
      description: 'Test Description 2',
      state: { name: 'In Progress' }
    }
  ]
}

export const handlers = [
  http.post('https://api.linear.app/graphql', async ({ request }) => {
    const { query, variables } = await request.json()

    // Project Query
    if (query.includes('project(id:')) {
      return Response.json({
        data: {
          project: {
            id: variables.id || 'test-project-id',
            name: 'Test Project',
            issues: mockIssues
          }
        }
      })
    }

    // Initiative Query
    if (query.includes('initiative(id:')) {
      return Response.json({
        data: {
          initiative: {
            id: variables.id || 'test-initiative-id',
            name: 'Test Initiative',
            projects: {
              nodes: [
                {
                  id: 'test-project-1',
                  name: 'Test Project 1',
                  issues: mockIssues
                }
              ]
            }
          }
        }
      })
    }

    // Issue Query
    if (query.includes('issue(id:')) {
      return Response.json({
        data: {
          issue: {
            id: variables.id || 'test-issue-id',
            title: 'Test Issue',
            description: 'Test Description',
            state: { name: 'Todo' }
          }
        }
      })
    }

    return Response.error()
  })
] 
