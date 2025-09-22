import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './helpers/jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailModule } from 'src/mail/mail.module';
import { PasswordController } from './controllers/password.controller';
import { SessionController } from './controllers/session.controller';
import { VerificationController } from './controllers/verification.controller';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';
import { VerificationService } from './services/verification.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // optional: jika kamu pakai ConfigModule
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') ||
          process.env.JWT_SECRET ||
          'dev-secret',
        signOptions: {
          expiresIn:
            config.get<string>('JWT_EXPIRES_IN') ||
            process.env.JWT_EXPIRES_IN ||
            '1h',
        },
      }),
    }),
    MailModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    ConfigService,
    PasswordService,
    SessionService,
    VerificationService,
  ],
  controllers: [
    AuthController,
    PasswordController,
    SessionController,
    VerificationController,
  ],
  exports: [AuthService],
})
export class AuthModule {}
