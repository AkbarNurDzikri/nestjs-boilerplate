import {
  PaginatedResponse,
  PaginationQuery,
  SearchConfig,
} from 'src/common/helpers/services/pagination/schemas/pagination.schema';
import {
  ISanitizedUser,
  IUserWithRoles,
  userInclude,
} from '../interfaces/user-pagination.interface';
import { PaginationService } from 'src/common/helpers/services/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserList {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}
  async getAll(
    query: PaginationQuery,
  ): Promise<PaginatedResponse<ISanitizedUser>> {
    const config: SearchConfig = {
      searchableFields: ['email', 'name'],
      relations: ['roles.role'],
    };

    const raw = await this.paginationService.paginate<IUserWithRoles>(
      this.prisma.user,
      query,
      config,
      {
        include: userInclude,
      },
    );

    const sanitized = raw.data.map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, roles, ...clean } = d;

      return {
        ...clean,
        roles: roles.map((r) => ({ id: r.role.id, name: r.role.name })),
      };
    });

    return {
      data: sanitized,
      meta: raw.meta,
    };
  }
}
