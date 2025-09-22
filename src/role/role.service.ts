import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  create(data: RoleDto) {
    return this.prisma.role.create({
      data: { ...data, name: data.name.toLowerCase() },
    });
  }

  findAll() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  update(id: string, data: RoleDto) {
    return this.prisma.role.update({
      data: { ...data, name: data.name.toLowerCase() },
      where: { id },
    });
  }

  delete(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }
}
