const LOG_LEVELS = ["debug", "info", "warn", "error"];

const logger = {
  log: (level, message, data = null) => {
    if (!LOG_LEVELS.includes(level)) {
      console.error(`[Logger] Invalid log level: ${level}`);
      return;
    }

    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    console[level](formatted, data || "");
  },

  info: (msg, data) => logger.log("info", msg, data),
  warn: (msg, data) => logger.log("warn", msg, data),
  error: (msg, data) => logger.log("error", msg, data),
  debug: (msg, data) => logger.log("debug", msg, data),
};

export default logger;
