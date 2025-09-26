import { PrismaOrderByInput } from '../schemas/pagination.schema';
import { buildNestedOrderBy } from './build-nested-order-by';

export const buildOrderBy = (
  sortBy: string | undefined,
  sortOrder: 'asc' | 'desc',
  defaultSortField: string = 'createdAt',
): PrismaOrderByInput => {
  const field = sortBy || defaultSortField;
  const fieldParts = field.split('.');

  if (fieldParts.length === 1) {
    return { [field]: sortOrder };
  }

  return buildNestedOrderBy(fieldParts, sortOrder);
};
