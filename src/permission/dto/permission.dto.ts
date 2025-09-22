import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const PermissionSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
  })
  .strict();

export class PermissionDto extends createZodDto(PermissionSchema) {}
