import { PrismaWhereInput } from '../schemas/pagination.schema';

export const buildNestedSearch = (
  fieldParts: string[],
  search: string,
): PrismaWhereInput => {
  const [currentField, ...remainingFields] = fieldParts;

  if (remainingFields.length === 0) {
    return {
      [currentField]: {
        contains: search,
        mode: 'insensitive',
      },
    };
  }

  return {
    [currentField]: buildNestedSearch(remainingFields, search),
  };
};
