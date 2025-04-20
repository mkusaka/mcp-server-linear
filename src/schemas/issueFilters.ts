import { z } from "zod";

const StringComparators = z.object({
  eq: z.string().optional().describe("Equals the given value"),
  neq: z.string().optional().describe("Doesn't equal the given value"),
  in: z.array(z.string()).optional().describe("Value is in the given collection of values"),
  nin: z.array(z.string()).optional().describe("Value is not in the given collection of values"),
  eqIgnoreCase: z.string().optional().describe("Case insensitive equals"),
  neqIgnoreCase: z.string().optional().describe("Case insensitive doesn't equal"),
  startsWith: z.string().optional().describe("Starts with the given value"),
  notStartsWith: z.string().optional().describe("Doesn't start with the given value"),
  endsWith: z.string().optional().describe("Ends with the given value"),
  notEndsWith: z.string().optional().describe("Doesn't end with the given value"),
  contains: z.string().optional().describe("Contains the given value"),
  notContains: z.string().optional().describe("Doesn't contain the given value"),
  containsIgnoreCase: z.string().optional().describe("Case insensitive contains"),
  notContainsIgnoreCase: z.string().optional().describe("Case insensitive doesn't contain"),
}).partial();

const NumberComparators = z.object({
  eq: z.number().optional().describe("Equals the given value"),
  neq: z.number().optional().describe("Doesn't equal the given value"),
  in: z.array(z.number()).optional().describe("Value is in the given collection of values"),
  nin: z.array(z.number()).optional().describe("Value is not in the given collection of values"),
  lt: z.number().optional().describe("Less than the given value"),
  lte: z.number().optional().describe("Less than or equal to the given value"),
  gt: z.number().optional().describe("Greater than the given value"),
  gte: z.number().optional().describe("Greater than or equal to the given value"),
}).partial();

const DateComparators = z.object({
  eq: z.string().optional().describe("Equals the given date value"),
  neq: z.string().optional().describe("Doesn't equal the given date value"),
  in: z.array(z.string()).optional().describe("Date is in the given collection of dates"),
  nin: z.array(z.string()).optional().describe("Date is not in the given collection of dates"),
  lt: z.string().optional().describe("Date is before the given date"),
  lte: z.string().optional().describe("Date is before or equal to the given date"),
  gt: z.string().optional().describe("Date is after the given date"),
  gte: z.string().optional().describe("Date is after or equal to the given date"),
}).partial();

const BooleanComparators = z.object({
  eq: z.boolean().optional().describe("Equals the given boolean value"),
  neq: z.boolean().optional().describe("Doesn't equal the given boolean value"),
}).partial();

const NullComparator = z.object({
  null: z.boolean().optional().describe("Field is null or not null"),
}).partial();

const IdFilter = z.object({
  id: z.object({
    eq: z.string().optional(),
    neq: z.string().optional(),
    in: z.array(z.string()).optional(),
    nin: z.array(z.string()).optional(),
  }).partial().optional(),
});

const TeamFilter = IdFilter.extend({
  name: StringComparators.optional(),
}).partial();

const UserFilter = IdFilter.extend({
  name: StringComparators.optional(),
  email: StringComparators.optional(),
}).partial();

const ProjectFilter = IdFilter.extend({
  name: StringComparators.optional(),
}).partial();

const StateFilter = IdFilter.extend({
  name: StringComparators.optional(),
  type: StringComparators.optional(),
}).partial();

const LabelFilter = IdFilter.extend({
  name: StringComparators.optional(),
}).partial();

export type IssueFilterType = z.infer<typeof IssueFilterSchema>;

export const IssueFilterSchema: z.ZodType<any> = z.lazy(() => 
  z.object({
    search: z.string().optional().describe("Free text search across issue title and description"),
    
    team: TeamFilter.optional().describe("Filter by team properties"),
    assignee: UserFilter.optional().describe("Filter by assignee properties"),
    creator: UserFilter.optional().describe("Filter by creator properties"),
    project: ProjectFilter.optional().describe("Filter by project properties"),
    state: StateFilter.optional().describe("Filter by state properties"),
    labels: LabelFilter.optional().describe("Filter by label properties"),
    
    title: StringComparators.optional().describe("Filter by issue title"),
    description: StringComparators.optional().describe("Filter by issue description"),
    identifier: StringComparators.optional().describe("Filter by issue identifier"),
    priority: NumberComparators.optional().describe("Filter by issue priority (1-4)"),
    estimate: NumberComparators.optional().describe("Filter by issue estimate"),
    
    createdAt: DateComparators.optional().describe("Filter by creation date"),
    updatedAt: DateComparators.optional().describe("Filter by last update date"),
    completedAt: DateComparators.optional().describe("Filter by completion date"),
    dueDate: DateComparators.optional().describe("Filter by due date"),
    
    isBlocked: BooleanComparators.optional().describe("Filter by blocked status"),
    isBlocker: BooleanComparators.optional().describe("Filter by blocker status"),
    
    or: z.array(z.lazy(() => IssueFilterSchema)).optional().describe("Logical OR operator for alternative conditions"),
    and: z.array(z.lazy(() => IssueFilterSchema)).optional().describe("Logical AND operator for combined conditions"),
    not: z.lazy(() => IssueFilterSchema).optional().describe("Logical NOT operator to negate a condition"),
  }).partial()
);

export const SearchIssuesSchema = z.object({
  filter: IssueFilterSchema.optional().describe("Filter criteria for issues"),
  first: z.number().optional().describe("Number of issues to return").default(50),
  after: z.string().optional().describe("Cursor for pagination"),
  orderBy: z.enum(["createdAt", "updatedAt", "priority", "title"]).optional().describe("Field to order results by").default("updatedAt"),
  orderDirection: z.enum(["ASC", "DESC"]).optional().describe("Direction to order results").default("DESC"),
});
