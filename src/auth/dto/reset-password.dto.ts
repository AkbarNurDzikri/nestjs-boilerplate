import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6),
});

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}
