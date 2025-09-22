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
import { PermissionDto } from './dto/permission.dto';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions.constants';

@ApiTags('Permissions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create new permission' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'create',
          description: 'nama izin akses',
        },
        description: {
          type: 'string',
          example: '',
          description: 'keterangan tambahan untuk nama izin akses yang dibuat',
        },
      },
      required: ['name'],
    },
  })
  @Permissions(PERMISSIONS.PERMISSION.create.name)
  create(@Body() data: PermissionDto) {
    return this.permissionService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @Permissions(PERMISSIONS.PERMISSION.list.name)
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific permission' })
  @Permissions(PERMISSIONS.PERMISSION.read.name)
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Partial update' })
  @Permissions(PERMISSIONS.PERMISSION.update.name)
  update(@Param('id') id: string, @Body() data: PermissionDto) {
    return this.permissionService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission' })
  @Permissions(PERMISSIONS.PERMISSION.delete.name)
  delete(@Param('id') id: string) {
    return this.permissionService.delete(id);
  }
}
