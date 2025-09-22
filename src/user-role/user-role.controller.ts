import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRoleService } from './user-role.service';
import { UserRoleDto } from './dto/user-role.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions.constants';

@ApiTags('User-Roles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Post()
  @ApiOperation({ summary: 'Assign/unassign role to user' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          example: 'userId',
          description: 'user unique id',
        },
        roleId: {
          type: 'string',
          example: 'roleId',
          description: 'role unique id',
        },
      },
      required: ['userId', 'roleId'],
    },
  })
  @Permissions(PERMISSIONS.USER_ROLE.toggle.name)
  toggle(@Body() data: UserRoleDto) {
    return this.userRoleService.toggle(data);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get roles by user id' })
  @Permissions(PERMISSIONS.USER_ROLE.read.name)
  findByUser(@Param('userId') userId: string) {
    return this.userRoleService.findByUser(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pairing user roles' })
  @Permissions(PERMISSIONS.ROLE_PERMISSION.list.name)
  findAll() {
    return this.userRoleService.findAll();
  }
}
