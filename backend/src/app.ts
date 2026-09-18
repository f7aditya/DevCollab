import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './core/errors/AppError';

export const app: Application = express();

// Security middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: true,
  credentials: true,
}));

import { authRouter } from './modules/auth/auth.routes';
import { projectRouter } from './modules/projects/project.routes';
import { projectRoleRouter } from './modules/projects/projectRole.routes';
import { taskRouter } from './modules/tasks/task.routes';
import { chatRouter } from './modules/chat/chat.routes';
import { postRouter } from './modules/posts/post.routes';
import { jobRouter } from './modules/jobs/job.routes';
import { globalJobRouter } from './modules/jobs/globalJob.routes';
import { notificationRouter } from './modules/notifications/notification.routes';
import { searchRouter } from './modules/search/search.routes';
import { userRouter } from './modules/users/user.routes';
import { fileRouter } from './modules/files/file.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { githubRouter } from './modules/integrations/github/github.routes';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { logger } from './core/logger';
import path from 'path';

// Security Headers (already applied above)

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per window in prod, 1000 in dev
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Structured Logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

// Body parser
app.use(express.json({ 
  limit: '10mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/projects/:projectId/members', projectRoleRouter);
app.use('/api/v1/projects/:projectId/tasks', taskRouter);
app.use('/api/v1/projects/:projectId/channels', chatRouter);
app.use('/api/v1/projects/:projectId/posts', postRouter);
app.use('/api/v1/projects/:projectId/jobs', jobRouter);
app.use('/api/v1/jobs', globalJobRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/files', fileRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/integrations/github', githubRouter);

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Handle undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler (must be the last middleware)
app.use(errorHandler);
