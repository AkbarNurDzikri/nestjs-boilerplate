import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

const envFile = `.env.${process.env.NODE_ENV}`;
const envPath = resolve(process.cwd(), envFile);

if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggerService } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', '*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('User Management System API')
    .setDescription(
      `This API provides a **User Management System** with **Role-Based Access Control (RBAC)**, built using NestJS.`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  const logger = app.get<LoggerService>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  app.useGlobalPipes(new ZodValidationPipe());
  app.use(cookieParser());

  await app.listen(process.env.NESTJS_PORT ?? 3000);
}
bootstrap().catch((e) => console.error(e));
