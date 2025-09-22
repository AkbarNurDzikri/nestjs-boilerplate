import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Response } from 'express';
import { SessionService } from '../services/session.service';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions.constants';
import { PermissionsGuard } from '../guards/permissions.guard';

@Controller('auth/sessions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Post('cleanup-tokens')
  @Permissions(PERMISSIONS.SESSION.deleteExpired.name)
  @ApiOperation({ summary: 'Cleanup expired tokens' })
  async cleanupExpiredTokens() {
    return this.sessionService.cleanupExpiredTokens();
  }

  @Delete(':sessionId')
  @Permissions(PERMISSIONS.SESSION.revoke.name)
  @ApiOperation({ summary: 'Revoke specific session' })
  async revokeSession(
    @GetUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionService.revokeSession(userId, sessionId);
  }

  @Get()
  @Permissions(PERMISSIONS.SESSION.list.name)
  @ApiOperation({ summary: 'Get active sessions' })
  async getSessions(@GetUser('id') userId: string) {
    return this.sessionService.getActiveSessions(userId);
  }

  @Post('logout-all')
  @Permissions(PERMISSIONS.SESSION.logoutMe.name)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAll(
    @GetUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.sessionService.logoutAllDevices(userId, res);
  }
}
