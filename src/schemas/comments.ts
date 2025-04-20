import { z } from "zod";

export const GetIssueCommentsSchema = z.object({
  issueId: z
    .string()
    .min(1, "issue id is required")
    .describe("target issue id"),
});

export const GetCommentSchema = z.object({
  commentId: z
    .string()
    .min(1, "comment id is required")
    .describe("target comment id"),
});

export const CreateCommentSchema = z.object({
  issueId: z
    .string()
    .min(1, "issue id is required")
    .describe("target issue id"),
  body: z.string().min(1, "body is required").describe("comment body"),
});

export const UpdateCommentSchema = z.object({
  commentId: z
    .string()
    .min(1, "comment id is required")
    .describe("target comment id"),
  body: z.string().min(1, "body is required").describe("comment body"),
});

export const DeleteCommentSchema = z.object({
  commentId: z
    .string()
    .min(1, "comment id is required")
    .describe("target comment id"),
});
