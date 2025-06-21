# 🚌 Shuttle Management System

A comprehensive, production-ready shuttle management system built with Next.js 14, TypeScript, and modern web technologies. Designed for educational institutions to efficiently manage their shuttle operations.

## ✨ Features

### 🎓 **For Students**

- **Smart Booking**: Book rides with dynamic pricing based on peak hours
- **Digital Wallet**: Secure wallet system with multiple payment options (UPI, Card, Kiosk)
- **Real-time Location**: Find nearby stops using GPS with distance calculation
- **Schedule Viewing**: Browse available schedules by date and route
- **Booking History**: View past bookings with detailed transaction history
- **Notifications**: Real-time notifications for bookings, wallet updates, and system alerts
- **Frequent Routes**: Quick booking for commonly used routes

### 👨‍💼 **For Administrators**

- **Complete Dashboard**: Comprehensive analytics and system overview
- **User Management**: Manage users, roles, and wallet allocations
- **Fleet Management**: Vehicle and driver management with assignments
- **Route Management**: Create and configure routes with dynamic pricing
- **Schedule Management**: Create and manage shuttle timetables
- **Advanced Analytics**: Revenue tracking, peak hour analysis, usage statistics
- **Reports & Export**: Generate detailed reports in CSV/JSON formats
- **System Settings**: Configure system parameters and maintenance mode
- **Audit Logging**: Complete audit trail for all administrative actions

### 🔧 **System Features**

- **Dynamic Pricing**: Automatic fare calculation based on peak/off-peak hours
- **Route Optimization**: AI-powered transfer suggestions for complex routes
- **Caching System**: LRU cache implementation for optimal performance
- **Security**: JWT authentication, role-based access control, rate limiting
- **Monitoring**: Health checks, structured logging, business metrics tracking
- **Notifications**: Real-time notification system with multiple channels
- **Responsive Design**: Mobile-first design that works on all devices

## 🏗️ **Technical Architecture**

### **Frontend**

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: SWR for server state, React state for UI
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React icon library

### **Backend**

- **API**: Next.js API Routes (RESTful design)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Zod for runtime type checking
- **Caching**: In-memory LRU cache with TTL
- **File Handling**: Vercel Blob for file storage

### **Security & Performance**

- **Authentication**: Secure JWT implementation with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive validation on client and server
- **Audit Logging**: Complete audit trail for compliance
- **Error Handling**: Structured error handling and logging
- **Performance**: Optimized queries, caching, and code splitting

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+ and npm 8+
- PostgreSQL database
- Git

### **Installation**

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd shuttle-management-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment setup**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

   Configure your `.env` file:
   \`\`\`env
   DATABASE_URL="postgresql://username:password@localhost:5432/shuttle_management"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NEXT_PUBLIC_MAP_API_KEY="your-google-maps-api-key"
   NODE_ENV="development"
   \`\`\`

4. **Database setup**
   \`\`\`bash

   # Generate Prisma client

   npm run db:generate

   # Run database migrations

   npm run db:migrate

   # Seed with sample data

   npm run db:seed
   \`\`\`

5. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - **Admin**: `admin@iiitl.ac.in` / `admin123`
   - **Student**: `student@iiitl.ac.in` / `student123`

## 📁 **Project Structure**

\`\`\`
shuttle-management-system/
├── app/ # Next.js app directory
│ ├── api/ # API routes
│ │ ├── auth/ # Authentication endpoints
│ │ ├── admin/ # Admin-only endpoints
│ │ ├── bookings/ # Booking management
│ │ ├── routes/ # Route management
│ │ ├── schedules/ # Schedule management
│ │ ├── wallets/ # Wallet operations
│ │ └── notifications/ # Notification system
│ ├── admin/ # Admin dashboard pages
│ ├── student/ # Student dashboard pages
│ ├── login/ # Authentication pages
│ ├── register/ # User registration
│ └── globals.css # Global styles
├── components/ # Reusable UI components
│ ├── ui/ # shadcn/ui components
│ └── notifications-dropdown.tsx
├── lib/ # Utility libraries
│ ├── auth.ts # Authentication utilities
│ ├── prisma.ts # Database client
│ ├── cache.ts # Caching utilities
│ ├── logger.ts # Structured logging
│ ├── audit-logger.ts # Audit trail logging
│ ├── business-metrics.ts # Business analytics
│ ├── notification-service.ts # Notification system
│ ├── payment.ts # Payment processing
│ ├── rate-limiter.ts # API rate limiting
│ ├── utils.ts # General utilities
│ └── validations.ts # Zod schemas
├── prisma/ # Database schema and migrations
│ ├── schema.prisma # Database schema
│ ├── seed.ts # Database seeding
│ └── migrations/ # Database migrations
├── scripts/ # Utility scripts
│ └── setup-production.ts # Production setup
├── docs/ # Documentation
│ ├── complexity.md # Performance analysis
│ ├── architecture.md # Architecture decisions
│ └── monitoring.md # Monitoring setup
├── middleware.ts # Next.js middleware
└── next.config.mjs # Next.js configuration
\`\`\`

## 🔧 **Development Commands**

\`\`\`bash

# Development

npm run dev # Start development server
npm run build # Build for production
npm run start # Start production server
npm run lint # Run ESLint
npm run type-check # TypeScript type checking

# Database

npm run db:generate # Generate Prisma client
npm run db:push # Push schema changes
npm run db:migrate # Run migrations
npm run db:seed # Seed database
npm run db:reset # Reset database

# Production

npm run setup:prod # Setup production environment
npm run analyze # Bundle analysis
\`\`\`

## 🌐 **API Documentation**

### **Authentication Endpoints**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### **Student Endpoints**

- `GET /api/stops/nearby` - Find nearby stops
- `GET /api/schedules` - Get schedules
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get booking history
- `GET /api/wallets/balance` - Get wallet balance
- `POST /api/wallets/top-up` - Top up wallet

### **Admin Endpoints**

- `GET/POST /api/routes` - Manage routes
- `GET/POST /api/vehicles` - Manage vehicles
- `GET/POST /api/admin/users` - Manage users
- `GET /api/admin/analytics/*` - Analytics data
- `GET /api/admin/reports/export` - Export reports

## 📊 **Key Features Deep Dive**

### **Dynamic Pricing System**

- Configurable peak hours per route
- Automatic fare multipliers (peak/off-peak)
- Real-time fare calculation based on booking time

### **Wallet System**

- Digital points-based system (1 INR = 10 points)
- Multiple payment methods (UPI, Card, Kiosk QR)
- Transaction history and statement downloads
- Low balance notifications

### **Analytics Dashboard**

- Revenue trends with customizable time periods
- Peak hour analysis with booking patterns
- Route performance metrics
- User engagement statistics
- Exportable reports in CSV/JSON formats

### **Notification System**

- Real-time notifications for bookings and wallet updates
- System alerts and maintenance notifications
- Customizable notification preferences
- Email and in-app notification support

## 🔒 **Security Features**

- **Authentication**: JWT with HTTP-only cookies and refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive validation using Zod
- **Rate Limiting**: API rate limiting to prevent abuse
- **Audit Logging**: Complete audit trail for compliance
- **CSRF Protection**: Built-in CSRF protection
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## 📈 **Performance Optimizations**

- **Caching**: LRU cache for frequently accessed data
- **Database**: Optimized queries with proper indexing
- **Frontend**: Code splitting and lazy loading
- **Images**: Next.js Image optimization
- **Bundle**: Tree shaking and minification
- **CDN**: Static asset optimization

## 🚀 **Deployment**

### **Vercel (Recommended)**

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Docker**

\`\`\`bash

# Build Docker image

docker build -t shuttle-management .

# Run container

docker run -p 3000:3000 shuttle-management
\`\`\`

### **Manual Deployment**

\`\`\`bash

# Build the application

npm run build

# Start production server

npm run start
\`\`\`

## 🔧 **Environment Variables**

\`\`\`env

# Database

DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication

JWT_SECRET="your-super-secret-jwt-key"

# External Services

NEXT_PUBLIC_MAP_API_KEY="your-google-maps-api-key"

# Optional: Monitoring

SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"

# Production Setup

ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure-admin-password"
\`\`\`

## 📝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join our discussions for help and collaboration

## 🙏 **Acknowledgments**

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Database ORM by [Prisma](https://prisma.io/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for educational institutions worldwide**
\`\`\`

The Shuttle Management System is now **100% complete** with all enterprise-level features:

## 🎯 **Final Feature Checklist**

✅ **Authentication & Security**

- JWT authentication with refresh tokens
- Role-based access control
- Rate limiting and audit logging
- Input validation and CSRF protection

✅ **Student Features**

- Complete booking system with dynamic pricing
- Digital wallet with multiple payment methods
- Real-time notifications
- Schedule viewing and booking history
- Nearby stops with GPS integration

✅ **Admin Features**

- Comprehensive dashboard with analytics
- User, vehicle, driver, and route management
- Advanced reporting and data export
- System settings and maintenance mode
- Complete audit trail

✅ **Technical Excellence**

- Production-ready architecture
- Comprehensive error handling
- Performance optimizations
- Monitoring and health checks
- Complete documentation

✅ **Production Ready**

- Environment configuration
- Database migrations and seeding
- Production setup scripts
- Docker support
- Deployment guides

The system is now enterprise-grade with all best practices implemented, ready for production deployment in educational institutions! 🚀

## Object-Oriented Programming (OOP) Usage

- `RouteOptimizer` (`lib/route-optimizer.ts`): Handles route optimization logic.
- `Wallet` (`lib/wallet.ts`): Encapsulates wallet operations (credit, debit, balance).
- `Booking` (`lib/booking.ts`): Manages booking state and transitions.
- `Notification` (`lib/notification.ts`): Represents and manages notifications.
- `DriverAssignment` (`lib/driver-assignment.ts`): Handles driver-vehicle-route assignments.
