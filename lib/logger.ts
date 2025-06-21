export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

export class Logger {
  static log(level: LogLevel, message: string, meta?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      service: "shuttle-management",
      version: process.env.npm_package_version || "1.0.0",
    }

    if (process.env.NODE_ENV === "production") {
      console.log(JSON.stringify(logEntry))
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, meta || "")
    }
  }

  static error(message: string, error?: Error, meta?: any) {
    this.log(LogLevel.ERROR, message, {
      error: error?.message,
      stack: error?.stack,
      ...meta,
    })
  }

  static info(message: string, meta?: any) {
    this.log(LogLevel.INFO, message, meta)
  }

  static warn(message: string, meta?: any) {
    this.log(LogLevel.WARN, message, meta)
  }

  static debug(message: string, meta?: any) {
    this.log(LogLevel.DEBUG, message, meta)
  }
}
