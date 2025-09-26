import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  searchField: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export class PaginationQueryDto extends createZodDto(PaginationQuerySchema) {}

export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    meta: PaginationMetaSchema,
  });

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Simplified Prisma types
export type PrismaWhereInput = Record<string, any>;
export type PrismaOrderByInput = Record<string, any>;
export type PrismaIncludeInput = Record<string, any>;
export type PrismaSelectInput = Record<string, any>;

export interface MinimalPrismaModel {
  findMany(args?: any): Promise<any[]>;
  count(args?: any): Promise<number>;
}

// Prisma Model interface
export interface PrismaModel<T> {
  findMany(args?: {
    where?: PrismaWhereInput;
    orderBy?: PrismaOrderByInput;
    skip?: number;
    take?: number;
    include?: PrismaIncludeInput;
    select?: PrismaSelectInput;
    cursor?: any;
    distinct?: any;
  }): Promise<T[]>;

  count(args?: { where?: PrismaWhereInput }): Promise<number>;
}

// Search Configuration - HAPUS generic T yang tidak digunakan
export interface SearchConfig {
  searchableFields: string[];
  relations?: string[];
  defaultSortField?: string;
  select?: PrismaSelectInput;
  maxLimit?: number;
}

// Pagination options - HAPUS generic T yang tidak digunakan
export interface PaginationOptions {
  where?: PrismaWhereInput;
  include?: PrismaIncludeInput;
  select?: PrismaSelectInput;
  distinct?: string | string[];
  cursor?: Record<string, any>;
}

// Include structure
export type IncludeStructure = {
  [key: string]: boolean | { include: IncludeStructure };
};

export interface FindManyArgs {
  where?: PrismaWhereInput;
  orderBy?: PrismaOrderByInput;
  skip?: number;
  take?: number;
  include?: PrismaIncludeInput;
  select?: PrismaSelectInput;
  distinct?: string | string[];
  cursor?: Record<string, any>;
}
