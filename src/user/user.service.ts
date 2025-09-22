/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';
import { FileService } from 'src/shared/services/file.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private fileService: FileService,
  ) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    const sanitizedUsers = users.map(({ password, ...rest }) => {
      return {
        ...rest,
        roles: rest.roles.map((r) => ({ id: r.role.id, name: r.role.name })),
      };
    });

    return sanitizedUsers;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const { password, ...rest } = user;
    const formatted = {
      ...rest,
      roles: rest.roles.map((r) => ({ id: r.role.id, name: r.role.name })),
    };
    return formatted;
  }

  async update(id: string, data: UpdateUserDto, file?: Express.Multer.File) {
    try {
      // 1. Cek apakah user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
        select: { id: true, photoUrl: true },
      });

      if (!existingUser) {
        // Jika ada file yang diupload tapi user tidak ada, hapus file
        if (file) {
          await this.fileService.deleteFile(file.path);
        }
        throw new NotFoundException('User not found');
      }

      // 2. Prepare data update
      const fixedData = data.email
        ? { ...data, email: data.email.toLowerCase() }
        : data;

      let oldPhotoPath: string | null = null;

      // 3. Handle file upload jika ada
      if (file) {
        // Simpan path foto lama untuk dihapus nanti
        if (existingUser.photoUrl) {
          oldPhotoPath = this.fileService.getFullPath(existingUser.photoUrl);
        }

        // Update photoUrl dengan path file baru
        fixedData.photoUrl = this.fileService.getRelativePath(file.path);
      }

      // 4. Update user di database
      const result = await this.prisma.user.update({
        data: fixedData,
        where: { id },
      });

      // 5. Hapus foto lama setelah update berhasil
      if (file && oldPhotoPath) {
        await this.fileService.deleteFile(oldPhotoPath);
      }

      // 6. Remove password dari response
      const { password, ...rest } = result;
      return rest;
    } catch (error) {
      // Jika terjadi error dan ada file baru yang diupload, hapus file tersebut
      if (file) {
        await this.fileService.deleteFile(file.path);
      }
      throw error;
    }
  }
}
