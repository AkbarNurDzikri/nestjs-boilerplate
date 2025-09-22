import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { UploadFile } from 'src/common/decorators/upload-file';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions.constants';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @Permissions(PERMISSIONS.USER.list.name)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific user by user id' })
  @Permissions(PERMISSIONS.USER.read.name)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Partial update data user (not required permission, bcause all authorized user can update)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile photo file',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: 'User email address',
        },
        name: {
          type: 'string',
          example: 'John Doe',
          description: 'User full name',
        },
        password: {
          type: 'string',
          minLength: 6,
          example: 'password123',
          description: 'User password (minimum 6 characters)',
        },
      },
    },
  })
  @UploadFile('file', {
    maxSize: 7,
    allowedExt: ['.jpg', '.jpeg', '.png'],
    dest: './public/images/users',
  })
  update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.update(id, data, file);
  }
}
