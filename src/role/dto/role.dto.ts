import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const RoleSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
  })
  .strict();

export class RoleDto extends createZodDto(RoleSchema) {}
