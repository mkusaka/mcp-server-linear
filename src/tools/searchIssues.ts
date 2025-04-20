import { Result, err, ok } from "neverthrow";
import { getLinearClient } from "../utils/linear.js";
import { logger } from "../utils/logger.js";
import { z } from "zod";
import { SearchIssuesSchema } from "../schemas/issueFilters.js";

type SearchIssuesInput = z.infer<typeof SearchIssuesSchema>;

export async function searchIssuesTool(
  args: SearchIssuesInput
) {
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
    
    const response = await linearClient.client.rawRequest(`
      query SearchIssues(
        $filter: IssueFilter
        $first: Int
        $after: String
        $orderBy: PaginationOrderBy
      ) {
        issues(
          filter: $filter
          first: $first
          after: $after
          orderBy: $orderBy
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
    `, variables);
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response.data, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.error("Error searching issues", { error });
    return {
      content: [
        {
          type: "text" as const,
          text: `Error searching issues: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
}
