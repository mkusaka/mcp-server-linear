import winston from "winston";

const isDebugMode = process.argv.includes("--debug");

const getLogFile = (): string => {
  const logFileIndex = process.argv.indexOf("--log-file");
  if (logFileIndex !== -1 && logFileIndex + 1 < process.argv.length) {
    return process.argv[logFileIndex + 1];
  }
  return "linear-mcp.log";
};

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: isDebugMode
    ? [
        new winston.transports.File({ 
          filename: getLogFile(), 
          level: "info" 
        }),
      ]
    : [], // No transports when debug mode is disabled
});
