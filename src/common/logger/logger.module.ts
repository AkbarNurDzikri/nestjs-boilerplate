import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';

// Pastikan folder logs ada
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs', { recursive: true });
}

// Define type log info (extends bawaan winston)
interface LogInfo extends winston.Logform.TransformableInfo {
  level: string;
  message: string;
  timestamp?: string;
  context?: string;
}

@Module({
  imports: [
    WinstonModule.forRoot({
      exitOnError: false,
      transports: [
        // Console transport
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf((info) => {
              const { level, message, timestamp, context, ...meta } =
                info as LogInfo;
              const ctx = context ? ` [${context}]` : '';
              const rest = Object.keys(meta).length
                ? ` ${JSON.stringify(meta)}`
                : '';
              return `[${timestamp}] [${level}]${ctx} ${message}${rest}`;
            }),
          ),
        }),

        // File transport (errors only)
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),

        // Daily rotating file (info and above)
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  ],
})
export class LoggerModule {}
