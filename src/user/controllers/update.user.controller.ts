import {
  Body,
  Controller,
  Param,
  Patch,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserDto } from '../dto/user.dto';
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
import { UpdateUser } from '../services/update.user.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UpdateUserController {
  constructor(private readonly updateUser: UpdateUser) {}

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
    return this.updateUser.update(id, data, file);
  }
}
