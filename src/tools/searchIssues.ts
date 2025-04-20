import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";
import { z } from "zod";
import { SearchIssuesSchema } from "../schemas/issueFilters.js";

type SearchIssuesInput = z.infer<typeof SearchIssuesSchema>;

/**
 * Tool for searching issues with advanced filtering options
 *
 * Note: While the Linear SDK does provide a built-in issues() method that supports filtering,
 * we're using rawRequest here due to type compatibility issues with the SDK's method.
 * The Linear SDK's issues() method expects specific types that are challenging to match
 * with our externally configurable Zod schema.
 *
 * The rawRequest approach gives us more flexibility while still leveraging the
 * comprehensive filter schema we've defined.
 */
export async function searchIssuesTool(args: SearchIssuesInput) {
  try {
    logger.info("Searching issues with filter", { filter: args.filter });

    const linearClient = await getLinearClient();

    const variables: Record<string, any> = {
      first: args.first || 50,
      orderBy: args.orderBy || "updatedAt",
    };

    if (args.filter) {
      variables.filter = args.filter;
    }

    if (args.after) {
      variables.after = args.after;
    }

    if (args.orderDirection) {
      variables.orderDirection = args.orderDirection;
    }

    const response = await linearClient.client.rawRequest(
      `
      query SearchIssues(
        $filter: IssueFilter
        $first: Int
        $after: String
        $orderBy: PaginationOrderBy
        $orderDirection: PaginationOrderDirection
      ) {
        issues(
          filter: $filter
          first: $first
          after: $after
          orderBy: $orderBy
          orderDirection: $orderDirection
        ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            identifier
            title
            description
            url
            state {
              id
              name
              type
              color
            }
            assignee {
              id
              name
              email
            }
            team {
              id
              name
              key
            }
            project {
              id
              name
            }
            priority
            labels {
              nodes {
                id
                name
                color
              }
            }
            createdAt
            updatedAt
          }
        }
      }
    `,
      variables,
    );

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response.data, null, 2),
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
