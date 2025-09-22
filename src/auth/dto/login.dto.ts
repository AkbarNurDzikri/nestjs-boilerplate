import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(6),
});

const EmailOnlySchema = z.object({
  email: z.string().min(1).email(),
});

export class LoginDto extends createZodDto(LoginSchema) {}
export class EmailOnlyDto extends createZodDto(EmailOnlySchema) {}
