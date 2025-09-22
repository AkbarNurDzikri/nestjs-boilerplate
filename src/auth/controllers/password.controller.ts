import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { EmailOnlyDto } from '../dto/login.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { PasswordService } from '../services/password.service';

@Controller('auth/password')
export class PasswordController {
  constructor(private passwordService: PasswordService) {}

  @Post('forgot')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'admin@gmail.com',
          description: 'registered email',
        },
      },
      required: ['email'],
    },
  })
  async requestPasswordReset(@Body() data: EmailOnlyDto) {
    return this.passwordService.requestPasswordReset(data);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset password' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'randomcharacters',
        },
        newPassword: {
          type: 'string',
          example: 'verysecrettext',
        },
      },
      required: ['token', 'newPassword'],
    },
  })
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.passwordService.resetPassword(data);
  }
}
