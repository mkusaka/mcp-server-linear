import { InvalidInputLinearError, LinearError } from '@linear/sdk';
import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GetProjectSchema, GetProjectsSchema } from '../schemas/issues.js';
import { getLinearClient } from '../utils/linear.js';
import { logger } from '../utils/logger.js';

export const getProjectsResource: ToolCallback<typeof GetProjectsSchema.shape> = async (
  args,
  extra
) => {
  const client = getLinearClient();
  try {
    const projects = await client.projects({
      includeArchived: false,
      filter: {
        status: {
          type: { nin: ['completed', 'canceled'] },
        },
      },
    });

    return {
      content: [
        {
          type: 'resource' as const,
          resource: {
            uri: 'projects://list',
            text: JSON.stringify(
              {
                projects: projects.nodes.map(project => {
                  return {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    state: project.state,
                  };
                }),
              },
              null,
              2
            ),
            mimeType: 'application/json',
          },
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to get projects', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof InvalidInputLinearError) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                error: 'Invalid input',
                message: error.message,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
    if (error instanceof LinearError) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                error: 'Linear API error',
                message: error.message,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              error: 'Unexpected error',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
};

export const getProjectResource: ToolCallback<typeof GetProjectSchema.shape> = async (
  args,
  extra
) => {
  const client = getLinearClient();
  try {
    const project = await client.project(args.projectId as string);

    return {
      content: [
        {
          type: 'resource' as const,
          resource: {
            uri: `projects://${args.projectId}`,
            text: JSON.stringify(
              {
                project: {
                  id: project.id,
                  name: project.name,
                  description: project.description,
                  content: project.content,
                  state: project.state,
                },
              },
              null,
              2
            ),
            mimeType: 'application/json',
          },
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to get project', {
      error: error instanceof Error ? error.message : 'Unknown error',
      projectId: args.projectId,
    });

    if (error instanceof InvalidInputLinearError) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                error: 'Invalid input',
                message: error.message,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
    if (error instanceof LinearError) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                error: 'Linear API error',
                message: error.message,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              error: 'Unexpected error',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
};
