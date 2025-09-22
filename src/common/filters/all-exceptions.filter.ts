import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { Prisma } from '@prisma/client';

// -------- Helpers --------

// Ambil pesan dari HttpException response secara aman
function extractMessage(res: unknown, fallback: string): string {
  if (typeof res === 'string') return res;
  if (
    typeof res === 'object' &&
    res !== null &&
    'message' in res &&
    Array.isArray((res as { message?: unknown }).message)
  ) {
    return (res as { message: string[] }).message.join(', ');
  }
  if (
    typeof res === 'object' &&
    res !== null &&
    'message' in res &&
    typeof (res as { message?: unknown }).message === 'string'
  ) {
    return (res as { message: string }).message;
  }
  return fallback;
}

// Ambil error code dari response secara aman
function extractCode(res: unknown, fallback = 'HTTP_EXCEPTION'): string {
  if (
    typeof res === 'object' &&
    res !== null &&
    'code' in res &&
    (typeof (res as { code?: unknown }).code === 'string' ||
      typeof (res as { code?: unknown }).code === 'number')
  ) {
    return String((res as { code: string | number }).code);
  }
  return fallback;
}

// Pastikan hanya object aman yang bisa dipakai sebagai log
function safeRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

// -------- Log payload type --------
interface ExceptionLogPayload {
  status: number;
  errorCode: string | null;
  path: string;
  method: string;
  timestamp: string;
  developerMessage: string | object | ZodIssue[];
  stack?: string;
  requestId?: string | string[];
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let userMessage: string | string[] = 'An unexpected error occurred.';
    let developerMessage: string | object | ZodIssue[] = '';
    let code: string | null = null;

    // ------ HttpException ------
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      userMessage = extractMessage(res, exception.message);
      developerMessage = res;
      code = extractCode(res);
    }

    // ------ Prisma Known Errors ------
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      code = exception.code;
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          userMessage = 'Duplicate value. Field(s) must be unique.';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          userMessage = 'Record not found.';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          userMessage = 'Operation failed due to related data constraint.';
          break;
        case 'P1000':
          status = HttpStatus.SERVICE_UNAVAILABLE;
          userMessage = 'Authentication failed for database server';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          userMessage = 'Database error.';
      }
      developerMessage = exception.message;
    }

    // ------ Prisma Validation/Init Errors ------
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      userMessage = 'Invalid data.';
      developerMessage = exception.message;
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'DB_INIT_ERROR';
      userMessage = 'Database connection error.';
      developerMessage = exception.message;
    }

    // ------ Zod Errors ------
    else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'ZOD_VALIDATION_ERROR';
      userMessage = exception.errors.map(
        (e) => `${e.path.join('.')}: ${e.message}`,
      );
      developerMessage = exception.errors;
    }

    // ------ Generic Error ------
    else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      userMessage = 'An unexpected server error occurred.';
      developerMessage = exception.message;
    }

    // ------ Log payload (typed & safe) ------
    const logPayload: ExceptionLogPayload = {
      status,
      errorCode: code,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      developerMessage,
      stack: exception instanceof Error ? exception.stack : undefined,
      requestId: request.headers['x-request-id'],
      body: safeRecord(request.body),
      query: safeRecord(request.query),
      params: safeRecord(request.params),
    };

    // ------ Log the error safely ------
    const msg =
      Array.isArray(userMessage) && userMessage.length > 0
        ? userMessage.join('; ')
        : String(userMessage);

    this.logger.error(msg, JSON.stringify(logPayload), 'AllExceptionsFilter');

    // ------ Response to client ------
    response.status(status).json({
      success: false,
      statusCode: status,
      message: userMessage,
      error: code,
      details:
        process.env.NODE_ENV === 'development' ? developerMessage : undefined,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}
