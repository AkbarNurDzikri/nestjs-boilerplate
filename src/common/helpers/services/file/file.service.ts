import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileService {
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.access(filePath); // Cek apakah file exists
      await fs.unlink(filePath); // Hapus file
      console.log(`File deleted: ${filePath}`);
    } catch (err) {
      // File mungkin sudah tidak ada, log saja
      console.warn(
        `Failed to delete file: ${filePath}`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  getFullPath(relativePath: string): string {
    // Jika sudah full path, return as is
    if (path.isAbsolute(relativePath)) {
      return relativePath;
    }

    // Jika relative path, cek apakah sudah dimulai dengan "public" atau tidak
    const cleanPath = relativePath.replace(/^\//, ''); // Hapus leading slash

    if (cleanPath.startsWith('public/')) {
      // Jika sudah dimulai dengan "public/", langsung join dengan process.cwd()
      return path.join(process.cwd(), cleanPath);
    } else {
      // Jika belum, tambahkan "public/"
      return path.join(process.cwd(), 'public', cleanPath);
    }
  }

  getRelativePath(fullPath: string): string {
    // Misal file disimpan di: D:/project/public/images/users/file.jpg
    // Return: images/users/file.jpg (tanpa leading slash dan tanpa "public/")
    const publicDir = path.join(process.cwd(), 'public');
    const relativePath = fullPath.replace(publicDir, '').replace(/\\/g, '/');

    // Hapus leading slash jika ada
    return relativePath.replace(/^\//, '');
  }
}
