import { Logger } from "./logger"

export class AuditLogger {
  static async logUserAction(
    userId: string,
    action: string,
    resource: string,
    details?: any,
    ip?: string,
    userAgent?: string,
  ) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      resource,
      details,
      ip,
      userAgent,
      type: "user_action",
    }

    Logger.info("User action audit", { audit: auditEntry })
  }

  static async logAdminAction(
    adminId: string,
    action: string,
    targetResource: string,
    targetId?: string,
    changes?: any,
  ) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      adminId,
      action,
      targetResource,
      targetId,
      changes,
      severity: "high",
      type: "admin_action",
    }

    Logger.info("Admin action audit", { audit: auditEntry })
  }

  static async logSecurityEvent(event: string, severity: "low" | "medium" | "high" | "critical", details: any) {
    const securityEntry = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      details,
      type: "security_event",
    }

    Logger.warn("Security event", { security: securityEntry })
  }
}
