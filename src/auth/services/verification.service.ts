import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { IJwtPayload } from '../types/jwt-payload.interface';
import { EmailOnlyDto } from '../dto/login.dto';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async verifyEmail(data: VerifyEmailDto) {
    try {
      const payload = this.jwtService.verify<IJwtPayload>(data.token);

      if (payload.type !== 'verification') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.prisma.user.update({
        where: { id: payload.sub },
        data: { isActive: true },
      });

      return { message: 'Email verified successfully', userId: user.id };
    } catch (e) {
      console.error(
        `Failed to verify email: ${e instanceof Error ? e.message : e}`,
      );
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async resendVerification(data: EmailOnlyDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user)
      throw new BadRequestException(`User with email ${data.email} not found`);
    if (user.isActive)
      throw new BadRequestException(
        'The user is already active; no verification is required.',
      );

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'verification' },
      { expiresIn: '1d' },
    );

    await this.mailService.sendVerificationEmail(user.email, user.name, token);

    return { message: 'The email verification has been resent.' };
  }
}
