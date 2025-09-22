import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PermissionDto } from './dto/permission.dto';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  create(data: PermissionDto) {
    return this.prisma.permission.create({
      data: { ...data, name: data.name.toLowerCase() },
    });
  }

  findAll() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  update(id: string, data: PermissionDto) {
    return this.prisma.permission.update({
      data: { ...data, name: data.name.toLowerCase() },
      where: { id },
    });
  }

  delete(id: string) {
    return this.prisma.permission.delete({ where: { id } });
  }
}
