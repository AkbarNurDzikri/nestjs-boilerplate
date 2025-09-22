import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolePermissionDto } from './dto/role-permission.dto';

@Injectable()
export class RolePermissionService {
  constructor(private prisma: PrismaService) {}

  // Toggle assign/unassign permission ke role
  async toggle(data: RolePermissionDto) {
    const existing = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: data.roleId,
          permissionId: data.permissionId,
        },
      },
    });

    if (existing) {
      // Sudah ada → berarti switch OFF → hapus
      await this.prisma.rolePermission.delete({ where: { id: existing.id } });
      return { assigned: false };
    } else {
      // Belum ada → switch ON → buat
      await this.prisma.rolePermission.create({ data });
      return { assigned: true };
    }
  }

  // Ambil semua permissions untuk role tertentu
  async findByRole(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: { include: { permission: true } },
      },
    });

    if (!role) throw new NotFoundException(`Role with ID ${roleId} not found`);

    const permissions = role?.permissions.map((p) => ({
      id: p.id,
      name: p.permission.name,
      description: p.permission.description,
    }));

    const result = {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions,
    };

    return result;
  }

  // Ambil semua role-permission (jarang dipakai di UI, tapi bisa untuk admin view)
  findAll() {
    return this.prisma.rolePermission.findMany({
      include: {
        role: { select: { name: true } },
        permission: { select: { name: true } },
      },
    });
  }
}
