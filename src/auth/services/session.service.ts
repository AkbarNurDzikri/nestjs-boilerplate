import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Response } from 'express';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cleanup expired tokens (untuk cron job)
   */
  async cleanupExpiredTokens() {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return {
      message: `Cleaned up ${result.count} expired refresh tokens`,
    };
  }

  /**
   * Revoke specific session
   */
  async revokeSession(userId: string, sessionId: string) {
    const deleted = await this.prisma.refreshToken.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (deleted.count === 0) {
      throw new BadRequestException('Session not found');
    }

    return { message: 'Session revoked successfully' };
  }

  /**
   * Dapatkan daftar active sessions
   */
  async getActiveSessions(userId: string) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  /**
   * Logout dari semua device milik current user
   */
  async logoutAllDevices(userId: string, res: Response) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged out from all devices' };
  }
}
