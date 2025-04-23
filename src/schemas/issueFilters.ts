import { z } from "zod";

export const IssueFilterSchema = z
  .object({
    search: z
      .string()
      .optional()
      .describe("Free text search across issue title and description"),

    id: z.string().optional().describe("Issue ID"),
    title: z.string().optional().describe("Issue title"),
    description: z.string().optional().describe("Issue description"),
    identifier: z
      .string()
      .optional()
      .describe("Issue identifier (e.g. ENG-123)"),

    teamId: z.string().optional().describe("Team ID"),
    assigneeId: z.string().optional().describe("Assignee user ID"),
    creatorId: z.string().optional().describe("Creator user ID"),
    projectId: z.string().optional().describe("Project ID"),
    stateId: z.string().optional().describe("State ID"),
    labelIds: z.array(z.string()).optional().describe("Label IDs"),

    priority: z.number().optional().describe("Priority (1-4)"),
    estimate: z.number().optional().describe("Issue estimate"),

    createdAfter: z
      .string()
      .optional()
      .describe("Created after date (ISO string)"),
    createdBefore: z
      .string()
      .optional()
      .describe("Created before date (ISO string)"),
    updatedAfter: z
      .string()
      .optional()
      .describe("Updated after date (ISO string)"),
    updatedBefore: z
      .string()
      .optional()
      .describe("Updated before date (ISO string)"),

    includeArchived: z.boolean().optional().describe("Include archived issues"),
    includeCanceled: z.boolean().optional().describe("Include canceled issues"),
  })
  .partial();

export type IssueFilterType = z.infer<typeof IssueFilterSchema>;

export const SearchIssuesSchema = z.object({
  filter: IssueFilterSchema.optional().describe("Filter criteria for issues"),
  first: z
    .number()
    .optional()
    .describe("Number of issues to return")
    .default(50),
  after: z.string().optional().describe("Cursor for pagination"),
  orderBy: z
    .enum(["createdAt", "updatedAt", "priority", "title"])
    .optional()
    .describe("Field to order results by")
    .default("updatedAt"),
  orderDirection: z
    .enum(["ASC", "DESC"])
    .optional()
    .describe("Direction to order results")
    .default("DESC"),
});
