import { LinearClient } from "@linear/sdk";
import { logger } from "./logger.js";

let client: LinearClient | null = null;
export let issueStatusList: { id: string; name: string }[] = [];

export async function getLinearClient(): Promise<LinearClient> {
  if (!client) {
    const apiKey = process.env.LINEAR_API_KEY;
    const clientId = process.env.LINEAR_OAUTH_CLIENT_ID;
    const clientSecret = process.env.LINEAR_OAUTH_CLIENT_SECRET;

    logger.info("Initializing Linear client", {
      hasApiKey: !!apiKey,
      hasOAuthCredentials: !!(clientId && clientSecret),
      envKeys: Object.keys(process.env).filter((key) => key.includes("LINEAR")),
    });

    if (clientId && clientSecret) {
      logger.info("Using OAuth authentication");
      client = new LinearClient({ accessToken: clientSecret });
    } else if (apiKey) {
      logger.info("Using API key authentication");
      client = new LinearClient({ apiKey });
    } else {
      throw new Error(
        "Neither LINEAR_API_KEY nor OAuth credentials (LINEAR_OAUTH_CLIENT_ID, LINEAR_OAUTH_CLIENT_SECRET) are set in environment variables",
      );
    }
  }
  const statuses = await client.projectStatuses();
  issueStatusList = statuses.nodes.map((status) => ({
    id: status.id,
    name: status.name,
  }));
  return client;
}

// For testing purposes, reset the Linear client
export function resetLinearClient(): void {
  client = null;
}
