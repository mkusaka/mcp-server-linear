import winston from "winston";

interface LoggerConfig {
  debug?: boolean;
  logFile?: string;
}

const defaultConfig: LoggerConfig = {
  debug: false,
  logFile: "linear-mcp.log",
};

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [], // No transports by default
});

export function configureLogger(config: LoggerConfig = {}): void {
  const { debug, logFile } = { ...defaultConfig, ...config };
  
  logger.clear();
  
  if (debug) {
    logger.add(
      new winston.transports.File({
        filename: logFile,
        level: "info",
      })
    );
  }
}
