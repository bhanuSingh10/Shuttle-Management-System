# Monitoring and Logging Strategy

## Overview
This document outlines the monitoring, logging, and observability strategy for the Shuttle Management System.

## Current Implementation

### Logging
- **Console Logging**: Basic console.log statements throughout the application
- **Error Logging**: Try-catch blocks with error logging in API routes
- **Request Logging**: Implicit through Next.js and Vercel platform

### Error Handling
- **API Error Responses**: Structured JSON error responses with HTTP status codes
- **Frontend Error Boundaries**: Basic error handling with toast notifications
- **Database Errors**: Prisma error handling with user-friendly messages

## Recommended Production Setup

### Application Performance Monitoring (APM)

#### Vercel Analytics (Built-in)
\`\`\`typescript
// Already enabled with Vercel deployment
// Provides:
// - Core Web Vitals
// - Page load times
// - User sessions
// - Geographic distribution
\`\`\`

#### Custom Metrics Collection
\`\`\`typescript
// lib/metrics.ts
export class MetricsCollector {
  static async recordAPICall(endpoint: string, duration: number, status: number) {
    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      await fetch('/api/internal/metrics', {
        method: 'POST',
        body: JSON.stringify({
          type: 'api_call',
          endpoint,
          duration,
          status,
          timestamp: new Date().toISOString()
        })
      })
    }
  }

  static async recordBookingEvent(userId: string, routeId: string, success: boolean) {
    // Business metrics
    console.log('Booking event:', { userId, routeId, success })
  }
}
\`\`\`

### Structured Logging

#### Log Levels and Format
\`\`\`typescript
// lib/logger.ts
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export class Logger {
  static log(level: LogLevel, message: string, meta?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      service: 'shuttle-management',
      version: process.env.npm_package_version
    }

    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry))
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, meta || '')
    }
  }

  static error(message: string, error?: Error, meta?: any) {
    this.log(LogLevel.ERROR, message, { 
      error: error?.message, 
      stack: error?.stack, 
      ...meta 
    })
  }

  static info(message: string, meta?: any) {
    this.log(LogLevel.INFO, message, meta)
  }

  static warn(message: string, meta?: any) {
    this.log(LogLevel.WARN, message, meta)
  }
}
\`\`\`

### Database Monitoring

#### Query Performance Tracking
\`\`\`typescript
// lib/prisma-with-logging.ts
import { PrismaClient } from '@prisma/client'
import { Logger } from './logger'

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
})

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Log slow queries (>1s)
    Logger.warn('Slow database query detected', {
      query: e.query,
      duration: e.duration,
      params: e.params
    })
  }
})

prisma.$on('error', (e) => {
  Logger.error('Database error', new Error(e.message), {
    target: e.target
  })
})
\`\`\`

### Health Checks

#### API Health Endpoint
\`\`\`typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: 'unknown',
      cache: 'unknown',
      external_apis: 'unknown'
    }
  }

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`
    checks.checks.database = 'healthy'
  } catch (error) {
    checks.checks.database = 'unhealthy'
    checks.status = 'unhealthy'
  }

  // Cache check (if using Redis)
  checks.checks.cache = 'healthy' // Placeholder

  // External API checks (if any)
  checks.checks.external_apis = 'healthy' // Placeholder

  const status = checks.status === 'healthy' ? 200 : 503
  return NextResponse.json(checks, { status })
}
\`\`\`

### Error Tracking

#### Sentry Integration (Recommended)
\`\`\`typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  })
}

export { Sentry }
\`\`\`

### Business Metrics

#### Key Performance Indicators (KPIs)
\`\`\`typescript
// lib/business-metrics.ts
export class BusinessMetrics {
  static async trackBookingSuccess(userId: string, routeId: string, fareAmount: number) {
    Logger.info('Booking completed', {
      event: 'booking_success',
      userId,
      routeId,
      fareAmount,
      timestamp: new Date().toISOString()
    })
  }

  static async trackWalletTopUp(userId: string, amount: number, method: string) {
    Logger.info('Wallet top-up', {
      event: 'wallet_topup',
      userId,
      amount,
      method,
      timestamp: new Date().toISOString()
    })
  }

  static async trackRoutePopularity(routeId: string) {
    Logger.info('Route accessed', {
      event: 'route_view',
      routeId,
      timestamp: new Date().toISOString()
    })
  }
}
\`\`\`

## Alerting Strategy

### Critical Alerts
- Database connection failures
- API response time > 5 seconds
- Error rate > 5%
- Wallet transaction failures

### Warning Alerts
- API response time > 2 seconds
- Cache hit rate < 70%
- High memory usage (>80%)
- Unusual booking patterns

### Alert Channels
1. **Email**: For critical system failures
2. **Slack**: For warnings and daily summaries
3. **SMS**: For payment system failures

## Dashboard Recommendations

### Operational Dashboard
- System health status
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database performance metrics
- Active user sessions

### Business Dashboard
- Daily/weekly booking trends
- Revenue metrics
- Popular routes
- User engagement metrics
- Wallet usage patterns

## Log Retention Policy

### Production Logs
- **Application Logs**: 30 days
- **Access Logs**: 90 days
- **Error Logs**: 1 year
- **Audit Logs**: 7 years (compliance)

### Development Logs
- **Local Development**: Session only
- **Staging Environment**: 7 days

## Security Monitoring

### Audit Logging
\`\`\`typescript
// lib/audit-logger.ts
export class AuditLogger {
  static async logUserAction(userId: string, action: string, resource: string, details?: any) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      resource,
      details,
      ip: 'request-ip', // Extract from request
      userAgent: 'user-agent' // Extract from request
    }

    Logger.info('User action', { audit: auditEntry })
  }

  static async logAdminAction(adminId: string, action: string, targetResource: string) {
    Logger.info('Admin action', {
      audit: {
        timestamp: new Date().toISOString(),
        adminId,
        action,
        targetResource,
        severity: 'high'
      }
    })
  }
}
\`\`\`

### Security Events to Monitor
- Failed login attempts
- Admin privilege escalations
- Unusual API access patterns
- Large wallet transactions
- Bulk data exports

## Performance Monitoring

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### API Performance Targets
- **Authentication**: < 200ms
- **Booking Creation**: < 500ms
- **Data Retrieval**: < 300ms
- **Search Operations**: < 1s

## Implementation Priority

### Phase 1 (Immediate)
1. Structured logging implementation
2. Basic health checks
3. Error tracking setup
4. Business metrics collection

### Phase 2 (Short-term)
1. Performance monitoring
2. Alerting system
3. Security audit logging
4. Dashboard creation

### Phase 3 (Long-term)
1. Advanced analytics
2. Predictive monitoring
3. Automated incident response
4. Compliance reporting

## Tools and Services

### Recommended Stack
- **APM**: Vercel Analytics + Custom metrics
- **Error Tracking**: Sentry
- **Log Aggregation**: Vercel Logs + External service
- **Uptime Monitoring**: Pingdom or UptimeRobot
- **Dashboards**: Grafana or custom Next.js dashboard

### Cost Considerations
- Most monitoring can start with free tiers
- Scale monitoring budget with application growth
- Focus on high-impact metrics first
- Automate monitoring setup with infrastructure as code

This monitoring strategy provides a foundation for observability while remaining cost-effective and scalable as the system grows.
