import { InvalidInputLinearError, LinearError } from '@linear/sdk';
import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GetViewerSchema } from '../schemas/issues.js';
import { getLinearClient } from '../utils/linear.js';
import { logger } from '../utils/logger.js';

export const getViewerResource: ToolCallback<typeof GetViewerSchema.shape> = async (
  args,
  extra
) => {
  const client = getLinearClient();
  try {
    const viewer = await client.viewer;
    const teams = await viewer.teams();
    logger.info('Retrieved viewer info', {
      viewerId: viewer.id,
      teamsCount: teams.nodes.length,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              viewer: {
                id: viewer.id,
                name: viewer.name,
                email: viewer.email,
                teams: teams.nodes.map(team => ({
                  id: team.id,
                  name: team.name,
                  key: team.key,
                })),
              },
            },
            null,
            2
          ),
          mimeType: 'application/json',
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to get viewer', {
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
