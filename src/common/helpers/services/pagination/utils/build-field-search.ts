import { PrismaWhereInput } from '../schemas/pagination.schema';
import { buildNestedSearch } from './build-nested-search';

export const buildFieldSearch = (
  field: string,
  search: string,
): PrismaWhereInput => {
  const fieldParts = field.split('.');

  if (fieldParts.length === 1) {
    return {
      [fieldParts[0]]: {
        contains: search,
        mode: 'insensitive',
      },
    };
  }

  return buildNestedSearch(fieldParts, search);
};
