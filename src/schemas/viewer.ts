import { z } from "zod";

export const ViewerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  teamIds: z.array(z.string()),
});
