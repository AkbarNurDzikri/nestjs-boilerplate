import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

export const UserSchema = z
  .object({
    email: z.string().min(1).email(),
    name: z.string().min(1),
    password: z.string().min(6),
    photoUrl: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const UpdateUserSchema = UserSchema.partial();

export class CreateUserDto extends createZodDto(UserSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
