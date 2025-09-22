import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RolePermissionDto } from './dto/role-permission.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions.constants';

@ApiTags('Role-Permissions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('role-permissions')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Assign/unassign permission to role' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roleId: {
          type: 'string',
          example: 'roleId',
          description: 'role unique id',
        },
        permissionId: {
          type: 'string',
          example: 'permissionId',
          description: 'permission unique id',
        },
      },
      required: ['roleId', 'permissionId'],
    },
  })
  @Permissions(PERMISSIONS.ROLE_PERMISSION.toggle.name)
  toggle(@Body() data: RolePermissionDto) {
    return this.rolePermissionService.toggle(data);
  }

  @Get(':roleId')
  @ApiOperation({ summary: 'Get permissions by role id' })
  @Permissions(PERMISSIONS.ROLE_PERMISSION.read.name)
  findByRole(@Param('roleId') roleId: string) {
    return this.rolePermissionService.findByRole(roleId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pairing role permissions' })
  @Permissions(PERMISSIONS.ROLE_PERMISSION.list.name)
  findAll() {
    return this.rolePermissionService.findAll();
  }
}
