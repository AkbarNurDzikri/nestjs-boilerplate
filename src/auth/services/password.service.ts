import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailOnlyDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { IJwtPayload } from '../types/jwt-payload.interface';
import * as argon from 'argon2';

@Injectable()
export class PasswordService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async requestPasswordReset(data: EmailOnlyDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user)
      throw new BadRequestException(`User with email ${data.email} not found`);

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password_reset' },
      { expiresIn: '15m' },
    );

    await this.mailService.sendPasswordResetEmail(user.email, user.name, token);

    return {
      message: 'Password reset instructions have been sent to your email',
    };
  }

  async resetPassword(data: ResetPasswordDto) {
    const { token, newPassword } = data;

    try {
      const payload = this.jwtService.verify<IJwtPayload>(token);

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid token type');
      }

      const hashed = await argon.hash(newPassword);

      // Update password dan invalidate semua refresh tokens
      await Promise.all([
        this.prisma.user.update({
          where: { id: payload.sub },
          data: { password: hashed },
        }),
        this.prisma.refreshToken.deleteMany({
          where: { userId: payload.sub },
        }),
      ]);

      return { message: 'Password successfully reset. Please login again.' };
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}
