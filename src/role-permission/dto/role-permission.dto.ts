import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const RolePermissionsSchema = z
  .object({
    roleId: z.string().min(1).uuid(),
    permissionId: z.string().min(1).uuid(),
  })
  .strict();

export class RolePermissionDto extends createZodDto(RolePermissionsSchema) {}
