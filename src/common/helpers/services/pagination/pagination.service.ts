import { Injectable } from '@nestjs/common';
import {
  PaginatedResponse,
  PaginationQuery,
  PrismaWhereInput,
  SearchConfig,
  PaginationOptions,
  FindManyArgs,
  MinimalPrismaModel,
  PrismaModel,
} from './schemas/pagination.schema';
import { sanitizePaginationParams } from './utils/sanitize-pagination-params';
import { buildSearchWhere } from './utils/build-search-where';
import { buildOrderBy } from './utils/build-order-by';
import { buildInclude } from './utils/build-include';
import { generateMetaData } from './utils/generate-meta-data';

@Injectable()
export class PaginationService {
  constructor() {}

  async paginate<T>(
    model: MinimalPrismaModel,
    query: PaginationQuery,
    config: SearchConfig,
    additionalOptions: PaginationOptions = {},
  ): Promise<PaginatedResponse<T>> {
    const { search, searchField, sortBy, sortOrder } = query;
    const {
      searchableFields,
      relations = [],
      defaultSortField,
      select,
    } = config;

    // Sanitize pagination parameters
    const { page, limit } = sanitizePaginationParams(query, config);

    // Build where clause
    const searchWhere = buildSearchWhere(search, searchField, searchableFields);
    const whereClause: PrismaWhereInput = {
      ...additionalOptions.where,
      ...searchWhere,
    };

    // Build orderBy clause
    const orderBy = buildOrderBy(sortBy, sortOrder, defaultSortField);

    // Build include clause
    const include =
      Object.keys(additionalOptions.include || {}).length > 0
        ? additionalOptions.include
        : buildInclude(relations);

    // Calculate skip
    const skip = (page - 1) * limit;

    // Prepare findMany arguments dengan type yang tepat
    const findManyArgs: FindManyArgs = {
      where: whereClause,
      orderBy,
      skip,
      take: limit,
    };

    // Tambahkan include jika ada
    if (include && Object.keys(include).length > 0) {
      findManyArgs.include = include;
    }

    // Tambahkan select jika ada
    if (select && Object.keys(select).length > 0) {
      findManyArgs.select = select;
    }

    // Tambahkan additional options dengan type safety
    if (additionalOptions.distinct !== undefined) {
      findManyArgs.distinct = additionalOptions.distinct;
    }

    if (additionalOptions.cursor !== undefined) {
      findManyArgs.cursor = additionalOptions.cursor;
    }

    // Execute queries
    const [data, total] = await Promise.all([
      model.findMany(findManyArgs),
      model.count({ where: whereClause }),
    ]);

    // Generate metadata
    const meta = generateMetaData(page, limit, total);

    return {
      data: data as T[],
      meta,
    };
  }

  async paginateWithTransform<T extends object, R>(
    model: PrismaModel<T>,
    query: PaginationQuery,
    config: SearchConfig,
    transformFn: (data: T[]) => Promise<R[]> | R[],
    additionalOptions: PaginationOptions = {},
  ): Promise<PaginatedResponse<R>> {
    const result = await this.paginate<T>(
      model,
      query,
      config,
      additionalOptions,
    );

    const transformedData = await transformFn(result.data);

    return {
      data: transformedData,
      meta: result.meta,
    };
  }
}
