import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { IJwtPayload } from '../types/jwt-payload.interface';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request): string | null => {
          const cookies = req.cookies as Record<string, unknown> | undefined;
          if (cookies && typeof cookies.access_token === 'string') {
            return cookies.access_token;
          }

          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: IJwtPayload) {
    const userId = payload.sub;
    // ambil user dan relasi roles->role->permissions->permission
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return null;
    // buat arrays roles & permissions
    const roles = user.roles?.map((ur) => ur.role.name) ?? [];
    const permissions = (user.roles ?? [])
      .flatMap((ur) =>
        (ur.role.permissions ?? []).map((rp) => rp.permission.name),
      )
      .filter((v, i, a) => v && a.indexOf(v) === i); // unique

    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      roles,
      permissions,
    };
  }
}
