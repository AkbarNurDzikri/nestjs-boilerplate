import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { IJwtPayload } from './types/jwt-payload.interface';
import { CreateUserDto } from 'src/user/dto/user.dto';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { IRefreshTokenPayload } from './types/refresh-token-payload.interface';
import { IDeviceInfo } from './types/device-info.interface';
import { ITokenPair } from './types/token-pair.interface';

@Injectable()
export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate access token dengan payload lengkap
   */
  private signAccessToken(
    userId: string,
    roles: string[],
    permissions: string[],
  ) {
    const payload: IJwtPayload = {
      sub: userId,
      roles,
      permissions,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  /**
   * Generate refresh token
   */
  private signRefreshToken(userId: string, jti: string) {
    const payload: IRefreshTokenPayload = {
      sub: userId,
      jti,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });
  }

  /**
   * Generate unique JTI (JWT ID)
   */
  private generateJti(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Simpan refresh token ke database
   */
  private async storeRefreshToken(
    userId: string,
    jti: string,
    deviceInfo: IDeviceInfo,
    expiresAt: Date,
  ) {
    return this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId,
        deviceInfo: deviceInfo.userAgent || 'Unknown',
        ipAddress: deviceInfo.ipAddress || 'Unknown',
        expiresAt,
      },
    });
  }

  /**
   * Generate token pair (access + refresh)
   */
  private async generateTokenPair(
    userId: string,
    roles: string[],
    permissions: string[],
    deviceInfo: IDeviceInfo,
  ): Promise<ITokenPair> {
    const jti = this.generateJti();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari

    const accessToken = this.signAccessToken(userId, roles, permissions);
    const refreshToken = this.signRefreshToken(userId, jti);

    await this.storeRefreshToken(userId, jti, deviceInfo, expiresAt);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Set cookies untuk token
   */
  private setTokenCookies(res: Response, tokens: ITokenPair) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // Access token cookie (15 menit)
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 menit
    });

    // Refresh token cookie (7 hari)
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });
  }

  /**
   * Extract device info dari request
   */
  private extractDeviceInfo(req: Request): IDeviceInfo {
    return {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
      deviceId: req.headers['x-device-id'] as string,
    };
  }

  async register(data: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (exists) throw new BadRequestException('Email already registered');

    const hashed = await argon.hash(data.password);
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        password: hashed,
        isActive: false,
      },
    });

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'verification' },
      { expiresIn: '1d' },
    );

    await this.mailService.sendVerificationEmail(user.email, user.name, token);

    return {
      success: true,
      message: 'Register success, please check your email to verify account',
    };
  }

  async login(data: LoginDto, req: Request, res: Response) {
    const { email, password } = data;

    // Cari user dengan roles dan permissions
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive)
      throw new UnauthorizedException('Please verify your email first');

    const valid = await argon.verify(user.password, password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // Extract roles dan permissions
    const roles = user.roles.map((ur) => ur.role.name);
    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.name),
    );

    // Generate token pair
    const deviceInfo = this.extractDeviceInfo(req);
    const tokens = await this.generateTokenPair(
      user.id,
      roles,
      permissions,
      deviceInfo,
    );

    // Set cookies
    this.setTokenCookies(res, tokens);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles,
          permissions,
        },
        ...tokens,
      },
    };
  }

  /**
   * Refresh access token menggunakan refresh token
   */
  async refreshToken(refreshToken: string, req: Request, res: Response) {
    try {
      // Verify refresh token
      const payload =
        this.jwtService.verify<IRefreshTokenPayload>(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Cek refresh token di database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { id: payload.jti },
        include: {
          user: {
            include: {
              roles: {
                include: {
                  role: {
                    include: {
                      permissions: {
                        include: {
                          permission: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!storedToken || storedToken.userId !== payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (storedToken.expiresAt < new Date()) {
        // Hapus expired token
        await this.prisma.refreshToken.delete({
          where: { id: payload.jti },
        });
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = storedToken.user;
      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Extract roles dan permissions
      const roles = user.roles.map((ur) => ur.role.name);
      const permissions = user.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => rp.permission.name),
      );

      // Token Rotation: Hapus refresh token lama
      await this.prisma.refreshToken.delete({
        where: { id: payload.jti },
      });

      // Generate token pair baru
      const deviceInfo = this.extractDeviceInfo(req);
      const newTokens = await this.generateTokenPair(
        user.id,
        roles,
        permissions,
        deviceInfo,
      );

      // Set cookies baru
      this.setTokenCookies(res, newTokens);

      return {
        success: true,
        message: 'Token refreshed successfully',
        ...newTokens,
      };
    } catch (e) {
      console.error(
        `Failed to refresh token: ${e instanceof Error ? e.message : e}`,
      );
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Logout - hapus refresh token
   */
  async logout(refreshToken: string, res: Response) {
    try {
      if (refreshToken) {
        const payload =
          this.jwtService.verify<IRefreshTokenPayload>(refreshToken);
        await this.prisma.refreshToken.delete({
          where: { id: payload.jti },
        });
      }
    } catch (e) {
      // Token mungkin sudah invalid, tapi tetap lanjutkan logout
      console.warn(
        'Failed to revoke refresh token:',
        e instanceof Error ? e.message : e,
      );
    }

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { success: true, message: 'Logged out successfully' };
  }
}
