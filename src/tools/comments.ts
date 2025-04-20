import { InvalidInputLinearError, LinearError } from '@linear/sdk';
import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getLinearClient } from '../utils/linear.js';
import { logger } from '../utils/logger.js';
import {
  CreateCommentSchema,
  DeleteCommentSchema,
  GetCommentSchema,
  GetIssueCommentsSchema,
  UpdateCommentSchema,
} from '../schemas/comments.js';

export const getIssueCommentsResource: ToolCallback<typeof GetIssueCommentsSchema.shape> = async (
  args,
  extra
) => {
  const client = getLinearClient();
  try {
    const comments = await (await client.issue(args.issueId)).comments();

    const commentPayload = Promise.all(
      comments.nodes.map(async comment => ({
        id: comment.id,
        body: comment.body,
        user: (async () => {
          const user = await comment.user;
          if (!user) {
            return null;
          }
          return {
            id: user.id,
            name: user.name,
          };
        })(),
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      }))
    );

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              comments: commentPayload,
            },
            null,
            2
          ),
          mimeType: 'application/json',
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to get issue comments', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(
            {
              error: 'Failed to get issue comments',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
            null,
            2
          ),
          mimeType: 'application/json',
        },
      ],
      isError: true,
    };
  }
};

export const createCommentTool: ToolCallback<typeof CreateCommentSchema.shape> = async (
  args,
  extra
) => {
  const client = getLinearClient();
  try {
    const newComment = await client.createComment({
      issueId: args.issueId,
      body: args.body,
    });

    const commentPayload = await newComment.comment;
    if (!commentPayload) {
      logger.error('Comment not found after creation');
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Comment not found after creation',
          },
        ],
        isError: true,
      };
    }

    logger.info('Created comment', {
      commentId: commentPayload.id,
      body: commentPayload.body,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: 'Comment created successfully',
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to create comment', {
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

export const updateCommentTool: ToolCallback<typeof UpdateCommentSchema.shape> = async (
  args,
  extra
) => {
  const client = getLinearClient();
  try {
    const updatedComment = await client.updateComment(args.commentId, {
      body: args.body,
    });

    const commentPayload = await updatedComment.comment;
    if (!commentPayload) {
      logger.error('Comment not found after update');
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Comment not found after update',
          },
        ],
        isError: true,
      };
    }

    logger.info('Updated comment', {
      commentId: commentPayload.id,
      body: commentPayload.body,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: 'Comment updated successfully',
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to update comment', {
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

export const deleteCommentTool: ToolCallback<typeof DeleteCommentSchema.shape> = async (
  args,
  extra
) => {
  const client = getLinearClient();
  try {
    await client.deleteComment(args.commentId);

    logger.info('Deleted comment', {
      commentId: args.commentId,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: 'Comment deleted successfully',
        },
      ],
    };
  } catch (error) {
    logger.error('Failed to delete comment', {
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
