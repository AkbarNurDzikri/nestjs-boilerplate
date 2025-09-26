import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions.constants';
import { PaginationQueryDto } from 'src/common/helpers/services/pagination/schemas/pagination.schema';
import { UserList } from '../services/list.user.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class ListUserController {
  constructor(private readonly userList: UserList) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @Permissions(PERMISSIONS.USER.list.name)
  getAll(@Query() query: PaginationQueryDto) {
    return this.userList.getAll(query);
  }
}
