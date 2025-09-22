import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const UserRoleSchema = z
  .object({
    userId: z.string().min(1).uuid(),
    roleId: z.string().min(1).uuid(),
  })
  .strict();

export class UserRoleDto extends createZodDto(UserRoleSchema) {}
