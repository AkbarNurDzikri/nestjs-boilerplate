import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RoleDto } from './dto/role.dto';
import { RoleService } from './role.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { PERMISSIONS } from 'src/common/constants/permissions.constants';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create new role' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'admin',
          description:
            'nama role (peran) yang akan di lekatkan pada setiap role',
        },
        description: {
          type: 'string',
          example: '',
          description: 'keterangan untuk nama peran yang dibuat',
        },
      },
      required: ['name'],
    },
  })
  @Permissions(PERMISSIONS.ROLE.create.name)
  create(@Body() data: RoleDto) {
    return this.roleService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @Permissions(PERMISSIONS.ROLE.list.name)
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific role' })
  @Permissions(PERMISSIONS.ROLE.read.name)
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Partial update' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'user',
          description:
            'nama role (peran) yang akan di lekatkan pada setiap role',
        },
        description: {
          type: 'string',
          example: '',
          description: 'keterangan untuk nama peran yang dibuat',
        },
      },
      required: ['name'],
    },
  })
  @Permissions(PERMISSIONS.ROLE.update.name)
  update(@Param('id') id: string, @Body() data: RoleDto) {
    return this.roleService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @Permissions(PERMISSIONS.ROLE.delete.name)
  delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }
}
