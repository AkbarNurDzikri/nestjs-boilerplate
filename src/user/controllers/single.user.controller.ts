import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions.constants';
import { SingleUser } from '../services/single.user.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class SingleUserController {
  constructor(private readonly singleUser: SingleUser) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get specific user by user id' })
  @Permissions(PERMISSIONS.USER.read.name)
  findOne(@Param('id') id: string) {
    return this.singleUser.getOne(id);
  }
}
