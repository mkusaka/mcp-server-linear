import { z } from "zod";

export const CreateIssueSchema = z.object({
  title: z.string().min(1, "title is required").describe("issue title"),
  description: z.string().optional().describe("issue description"),
  teamId: z.string().min(1, "team id is required").describe("target team id"),
  projectId: z.string().optional().describe("target project id"),
  parentId: z.string().optional().describe("parent issue id"),
  dependencyIds: z
    .array(z.string())
    .optional()
    .describe("dependency issue ids"),
  labels: z.array(z.string()).optional().describe("issue labels"),
  estimate: z.number().optional().describe("issue estimate"),
  priority: z
    .enum(["low", "medium", "high"])
    .optional()
    .describe("issue priority"),
});

export const GetProjectsSchema = z.object({});
export const GetProjectSchema = z.object({
  projectId: z
    .string()
    .min(1, "project id is required")
    .describe("target project id"),
});

export const GetProjectIssuesSchema = z.object({
  projectId: z
    .string()
    .min(1, "target project id")
    .describe("target project id"),
});

export const GetIssueSchema = z.object({
  issueId: z
    .string()
    .min(1, "issue id is required")
    .describe("target issue id"),
  includeComments: z
    .boolean()
    .optional()
    .describe("include comments")
    .default(true),
  includeChildren: z
    .boolean()
    .optional()
    .describe("include children")
    .default(true),
  includeParent: z
    .boolean()
    .optional()
    .describe("include parent")
    .default(true),
});

export const GetViewerSchema = z.object({});

export const GetIssueStatusListSchema = z
  .object({})
  .describe("get issue attachable status list");

export const GetIssuePrioritiesSchema = z
  .object({})
  .describe("get issue priorities which are linked to the issue");

export const GetIssueLabelsSchema = z.object({});

export const GetIssueEstimatesSchema = z.object({});

export const UpdateIssueSchema = z.object({
  issueId: z
    .string()
    .min(1, "issue id is required")
    .describe("target issue id"),
  title: z.string().optional().describe("issue title"),
  description: z.string().optional().describe("issue description"),
});

export const DeleteIssueSchema = z.object({
  issueId: z
    .string()
    .min(1, "issue id is required")
    .describe("target issue id"),
});

export const UpdateIssueLabelsSchema = z.object({
  issueId: z
    .string()
    .min(1, "issue id is required")
    .describe("target issue id"),
  labels: z.array(z.string()).optional().describe("issue labels"),
});

export const UpdateIssuePrioritySchema = z.object({
  issueId: z
    .string()
    .min(1, "issue id is required")
    .describe("target issue id"),
  priority: z
    .enum(["low", "medium", "high"])
    .optional()
    .describe("issue priority"),
});

export const UpdateIssueEstimateSchema = z.object({
  issueId: z
    .string()
    .min(1, "issue id is required")
    .describe("target issue id"),
  estimate: z.number().optional().describe("issue estimate"),
});

export const UpdateIssueStateSchema = z.object({
  issueId: z
    .string()
    .min(1, "issue id is required")
    .describe("target issue id"),
  stateId: z
    .string()
    .min(1, "state id is required")
    .describe("issue state id"),
});
