import path from 'path';
import 'express-async-errors';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { config } from './config/config';
import { connectDB } from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';
import indexRouter from './routes/index';

// =====================================================
// App Factory — creates and configures the Express app
// =====================================================
export const createApp = (): Application => {
  const app = express();

  // Security Middleware
  app.use(helmet());

  // Rate limiting — 100 requests per 15 min
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // CORS Configuration
  app.use(
    cors({
      origin: config.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsing & Logging
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(config.COOKIE_SECRET));

  // Serve local uploads folder for static assets
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // OpenAPI / Swagger Docs
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'ApexStore API Docs',
    customCssUrl: '',
    customfavIcon: '/favicon.ico',
  }));

  // API Routes
  app.use('/api', indexRouter);

  // Error Handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
