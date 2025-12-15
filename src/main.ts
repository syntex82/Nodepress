/**
 * Main application entry point
 * Bootstraps the NestJS application with all necessary middleware and configuration
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as jwt from 'jsonwebtoken';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable for development; configure properly in production
      // frameguard is handled by our custom middleware below
      frameguard: false,
    }),
  );

  // Secure iframe embedding for Theme Customizer
  // Only allows framing when a valid preview token is present
  const jwtSecret = process.env.JWT_SECRET || 'default-secret';
  app.use((req, res, next) => {
    const previewToken = req.query._preview_token as string;

    // If preview token is present and valid, allow framing
    if (previewToken) {
      try {
        // Verify token - must be signed with same secret
        const decoded = jwt.verify(previewToken, jwtSecret) as jwt.JwtPayload;

        // Token must be a preview token (has preview: true claim)
        if (decoded && decoded.preview === true) {
          // Allow framing from admin origins
          const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.APP_URL,
          ].filter(Boolean);

          res.setHeader(
            'Content-Security-Policy',
            `frame-ancestors 'self' ${allowedOrigins.join(' ')}`,
          );
          // Don't set X-Frame-Options - let CSP handle it
          return next();
        }
      } catch (_e) {
        // Invalid token - fall through to deny framing
      }
    }

    // Default: deny framing (prevent clickjacking)
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // Cookie parser for session management
  app.use(cookieParser());

  // Session middleware for admin panel
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );

  // Global validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vite default port
    credentials: true,
  });

  // Serve static files (uploads, admin build, themes)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useStaticAssets(join(__dirname, '..', 'admin', 'dist'), {
    prefix: '/admin/',
  });

  app.useStaticAssets(join(__dirname, '..', 'themes'), {
    prefix: '/themes/',
  });

  // Set view engine for theme rendering
  app.setBaseViewsDir(join(__dirname, '..', 'themes'));
  app.setViewEngine('hbs');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    🚀 WordPress Node CMS is running!
    
    📍 Application: http://localhost:${port}
    📍 Admin Panel: http://localhost:${port}/admin
    📍 API: http://localhost:${port}/api
    
    Environment: ${process.env.NODE_ENV || 'development'}
  `);
}

bootstrap();
