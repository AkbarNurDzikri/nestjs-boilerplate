import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const VerifyEmailSchema = z.object({
  token: z.string().min(1),
});

export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}
