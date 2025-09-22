import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { EmailOnlyDto } from '../dto/login.dto';
import { VerificationService } from '../services/verification.service';

@Controller('auth/verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'randomcharacters',
          description: '',
        },
      },
      required: ['token'],
    },
  })
  async verifyEmail(@Body() data: VerifyEmailDto) {
    return this.verificationService.verifyEmail(data);
  }

  @Post('resend')
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'admin@gmail.com',
          description: 'registeredemail',
        },
      },
      required: ['email'],
    },
  })
  async resendVerification(@Body() data: EmailOnlyDto) {
    return this.verificationService.resendVerification(data);
  }
}
