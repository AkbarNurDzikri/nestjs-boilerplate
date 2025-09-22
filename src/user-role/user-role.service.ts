import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRoleDto } from './dto/user-role.dto';

@Injectable()
export class UserRoleService {
  constructor(private prisma: PrismaService) {}

  // Toggle assign/unassign permission ke user
  async toggle(data: UserRoleDto) {
    const existing = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: data.userId,
          roleId: data.roleId,
        },
      },
    });

    if (existing) {
      // Sudah ada → berarti switch OFF → hapus
      await this.prisma.userRole.delete({ where: { id: existing.id } });
      return { assigned: false };
    } else {
      // Belum ada → switch ON → buat
      await this.prisma.userRole.create({ data });
      return { assigned: true };
    }
  }

  // Ambil semua role untuk user tertentu
  async findByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        roles: { include: { role: true } },
      },
    });

    if (!user) return null;

    const roles = user.roles.map((u) => ({
      id: u.id,
      name: u.role.name,
      description: u.role.description,
    }));

    const result = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles,
    };

    return result;
  }

  // Ambil semua user-role (jarang dipakai di UI, tapi bisa untuk admin view)
  findAll() {
    return this.prisma.userRole.findMany({
      include: {
        user: { select: { name: true, email: true } },
        role: { select: { name: true } },
      },
    });
  }
}
