import { PaginationQuery, SearchConfig } from '../schemas/pagination.schema';

export const sanitizePaginationParams = (
  query: PaginationQuery,
  config: SearchConfig,
): { page: number; limit: number } => {
  const maxLimit = config.maxLimit || 100;
  const page = Math.max(1, query.page);
  const limit = Math.min(Math.max(1, query.limit), maxLimit);

  return { page, limit };
};
