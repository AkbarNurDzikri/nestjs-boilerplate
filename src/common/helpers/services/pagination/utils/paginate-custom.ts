import {
  PaginatedResponse,
  PaginationQuery,
} from '../schemas/pagination.schema';
import { generateMetaData } from './generate-meta-data';

export const paginateCustom = async <T, R = T>(
  queryFn: (skip: number, take: number) => Promise<T[]>,
  countFn: () => Promise<number>,
  query: PaginationQuery,
  transformFn?: (data: T[]) => Promise<R[]> | R[],
): Promise<PaginatedResponse<R>> => {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([queryFn(skip, limit), countFn()]);

  const transformedData = transformFn
    ? await transformFn(data)
    : (data as unknown as R[]);

  const meta = generateMetaData(page, limit, total);

  return {
    data: transformedData,
    meta,
  };
};
