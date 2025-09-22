import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const RefreshTokenSchema = z.object({
  userId: z.string().min(1),
  jti: z.string().min(1),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    deviceId: z.string().optional(),
  }),
  expiresAt: z.date(),
});

export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
