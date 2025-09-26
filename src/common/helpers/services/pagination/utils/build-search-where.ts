import { PrismaWhereInput } from '../schemas/pagination.schema';
import { buildFieldSearch } from './build-field-search';

export const buildSearchWhere = (
  search: string | undefined,
  searchField: string | undefined,
  searchableFields: string[],
): PrismaWhereInput => {
  if (!search || search.trim() === '') return {};

  // Jika searchField spesifik diberikan
  if (searchField) {
    return buildFieldSearch(searchField, search);
  }

  // Jika tidak ada searchField, cari di semua field yang bisa dicari
  const searchConditions = searchableFields.map((field) =>
    buildFieldSearch(field, search),
  );

  return { OR: searchConditions };
};
