import { z } from 'zod';
import { CreateIssueSchema } from '../schemas/issues.js';
import { getLinearClient } from '../utils/linear.js';
import { logger } from '../utils/logger.js';
import { Issue, LinearError, InvalidInputLinearError } from '@linear/sdk';
import { Result, ok, err } from 'neverthrow';

type CreateIssueError =
  | { type: 'INVALID_INPUT'; message: string }
  | { type: 'API_ERROR'; message: string }
  | { type: 'NOT_FOUND'; message: string };

export async function createIssue(
  input: z.infer<typeof CreateIssueSchema>
): Promise<Result<Partial<Issue>, CreateIssueError>> {
  const client = getLinearClient();
  try {
    const newIssue = await client.createIssue({
      teamId: input.teamId,
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      estimate: input.estimate,
      priority: input.priority === 'high' ? 1 : input.priority === 'medium' ? 2 : 3,
    });

    const issuePayload = await newIssue.issue;
    if (!issuePayload) {
      logger.error('Issue not found after creation');
      return err({ type: 'NOT_FOUND', message: 'Issue not found after creation' });
    }

    logger.info('Created issue', {
      issueId: issuePayload.id,
      title: input.title,
      teamId: input.teamId,
    });

    const issue = await client.issue(issuePayload.id);
    return ok({
      id: issue.id,
      title: issue.title,
      url: issue.url,
      state: issue.state,
      priority: issue.priority,
    });
  } catch (error) {
    if (error instanceof InvalidInputLinearError) {
      logger.error('Invalid input error', { error: error.message, input });
      return err({ type: 'INVALID_INPUT', message: error.message });
    }
    if (error instanceof LinearError) {
      logger.error('Linear API error', { error: error.message, input });
      return err({ type: 'API_ERROR', message: error.message });
    }
    logger.error('Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      input,
    });
    return err({ type: 'API_ERROR', message: 'Unexpected error occurred' });
  }
}
