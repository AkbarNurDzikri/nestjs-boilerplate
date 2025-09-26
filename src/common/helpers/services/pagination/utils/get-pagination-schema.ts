import {
  PaginationMeta,
  PaginationQuery,
  PrismaModel,
  PrismaWhereInput,
  SearchConfig,
} from '../schemas/pagination.schema';
import { buildSearchWhere } from './build-search-where';
import { generateMetaData } from './generate-meta-data';
import { sanitizePaginationParams } from './sanitize-pagination-params';

export const getPaginationMeta = async (
  model: PrismaModel<any>,
  query: PaginationQuery,
  config: SearchConfig,
  additionalWhere: PrismaWhereInput = {},
): Promise<PaginationMeta> => {
  const { search, searchField } = query;
  const { searchableFields } = config;
  const { page, limit } = sanitizePaginationParams(query, config);

  const searchWhere = buildSearchWhere(search, searchField, searchableFields);

  const whereClause = {
    AND: [additionalWhere, searchWhere],
  };

  const total = await model.count({ where: whereClause });

  return generateMetaData(page, limit, total);
};
