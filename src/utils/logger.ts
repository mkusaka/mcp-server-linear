import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // new winston.transports.Stream({
    //   stream: process.stderr,
    //   level: "info"
    // }),
    new winston.transports.File({ filename: "linear-mcp.log", level: "info" })
  ],
}); 
