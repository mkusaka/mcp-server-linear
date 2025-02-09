import { z } from "zod";

export const CreateIssueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  teamId: z.string().min(1, "Team ID is required"),
  projectId: z.string().optional(),
  parentId: z.string().optional(),
  dependencyIds: z.array(z.string()).optional(),
  labels: z.array(z.string()).optional(),
  estimate: z.number().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
}); 
