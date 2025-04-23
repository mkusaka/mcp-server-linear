import { z } from "zod";
import { SearchIssuesSchema } from "../schemas/issueFilters.js";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";

type SearchIssuesInput = z.infer<typeof SearchIssuesSchema>;

/**
 * Tool for searching issues with simplified filtering options
 *
 * This implementation uses the Linear SDK's issues() method directly,
 * which provides a more maintainable approach than using raw GraphQL queries.
 */
export async function searchIssuesTool(args: SearchIssuesInput) {
  try {
    logger.info("Searching issues with filter", { filter: args.filter });

    const linearClient = getLinearClient();

    const queryParams: Record<string, any> = {
      first: args.first || 50,
      orderBy: args.orderBy || "updatedAt",
    };

    if (args.after) {
      queryParams["after"] = args.after;
    }

    if (args.orderDirection) {
      queryParams["orderDirection"] = args.orderDirection;
    }

    if (args.filter) {
      const filter: Record<string, any> = {};

      if (args.filter.search) {
        filter["term"] = args.filter.search;
      }

      if (args.filter.id) filter["id"] = { eq: args.filter.id };
      if (args.filter.title) filter["title"] = { eq: args.filter.title };
      if (args.filter.description)
        filter["description"] = { eq: args.filter.description };
      if (args.filter.identifier)
        filter["identifier"] = { eq: args.filter.identifier };

      if (args.filter.teamId)
        filter["team"] = { id: { eq: args.filter.teamId } };
      if (args.filter.assigneeId)
        filter["assignee"] = { id: { eq: args.filter.assigneeId } };
      if (args.filter.creatorId)
        filter["creator"] = { id: { eq: args.filter.creatorId } };
      if (args.filter.projectId)
        filter["project"] = { id: { eq: args.filter.projectId } };
      if (args.filter.stateId)
        filter["state"] = { id: { eq: args.filter.stateId } };

      if (args.filter.labelIds && args.filter.labelIds.length > 0) {
        filter["labels"] = { id: { in: args.filter.labelIds } };
      }

      if (args.filter.priority !== undefined)
        filter["priority"] = { eq: args.filter.priority };
      if (args.filter.estimate !== undefined)
        filter["estimate"] = { eq: args.filter.estimate };

      if (args.filter.createdAfter)
        filter["createdAt"] = { gt: args.filter.createdAfter };
      if (args.filter.createdBefore)
        filter["createdAt"] = { lt: args.filter.createdBefore };
      if (args.filter.updatedAfter)
        filter["updatedAt"] = { gt: args.filter.updatedAfter };
      if (args.filter.updatedBefore)
        filter["updatedAt"] = { lt: args.filter.updatedBefore };

      if (args.filter.includeArchived !== undefined)
        filter["includeArchived"] = args.filter.includeArchived;
      if (args.filter.includeCanceled !== undefined)
        filter["includeCanceled"] = args.filter.includeCanceled;

      queryParams["filter"] = filter;
    }

    const issuesConnection = await linearClient.issues(queryParams);

    const nodes = await Promise.all(
      issuesConnection.nodes.map(async (issue) => {
        const stateData = issue.state ? await issue.state : null;
        const assigneeData = issue.assignee ? await issue.assignee : null;
        const teamData = issue.team ? await issue.team : null;
        const projectData = issue.project ? await issue.project : null;

        const labelNodes: { id: string; name: string; color: string }[] = [];

        return {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          description: issue.description,
          url: issue.url,
          state: stateData
            ? {
                id: stateData.id,
                name: stateData.name,
                type: stateData.type,
                color: stateData.color,
              }
            : null,
          assignee: assigneeData
            ? {
                id: assigneeData.id,
                name: assigneeData.name,
                email: assigneeData.email,
              }
            : null,
          team: teamData
            ? {
                id: teamData.id,
                name: teamData.name,
                key: teamData.key,
              }
            : null,
          project: projectData
            ? {
                id: projectData.id,
                name: projectData.name,
              }
            : null,
          priority: issue.priority,
          labels: {
            nodes: labelNodes,
          },
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
        };
      }),
    );

    const result = {
      pageInfo: {
        hasNextPage: issuesConnection.pageInfo.hasNextPage,
        endCursor: issuesConnection.pageInfo.endCursor,
      },
      nodes,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error("Error searching issues", { error });
    return {
      content: [
        {
          type: "text" as const,
          text: `Error searching issues: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
