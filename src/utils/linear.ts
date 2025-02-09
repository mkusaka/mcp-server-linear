import { LinearClient } from "@linear/sdk";
import { logger } from "./logger.js";

let client: LinearClient | null = null;

export function getLinearClient(): LinearClient {
  if (!client) {
    const apiKey = process.env.LINEAR_API_KEY;
    logger.info("Initializing Linear client", {
      hasApiKey: !!apiKey,
      envKeys: Object.keys(process.env).filter(key => key.includes("LINEAR"))
    });
    
    if (!apiKey) {
      throw new Error("LINEAR_API_KEY is not set in environment variables");
    }
    client = new LinearClient({ apiKey });
  }
  return client;
}

// テスト用にクライアントをリセットする関数を追加
export function resetLinearClient(): void {
  client = null;
} 
