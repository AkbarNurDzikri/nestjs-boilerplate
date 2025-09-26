import { PrismaOrderByInput } from '../schemas/pagination.schema';

export const buildNestedOrderBy = (
  fieldParts: string[],
  sortOrder: 'asc' | 'desc',
): PrismaOrderByInput => {
  const [currentField, ...remainingFields] = fieldParts;

  if (remainingFields.length === 0) {
    return { [currentField]: sortOrder };
  }

  return {
    [currentField]: buildNestedOrderBy(remainingFields, sortOrder),
  };
};
