import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

type FileCallback = (error: any, acceptFile: boolean) => void;

export type IMulterConfig = {
  dest?: string;
  allowedExt?: string[];
  maxSize?: number;
};

export const multerConfig = ({
  allowedExt = ['.jpg', '.png', '.jpeg', '.pdf'],
  dest = './public',
  maxSize = 2,
}: IMulterConfig = {}) => {
  return {
    storage: diskStorage({
      destination: dest,
      filename: (_req: Request, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
          Math.random() * 1e9,
        )}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    limits: { fileSize: maxSize * 1024 * 1024 },
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: FileCallback,
    ) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!allowedExt.includes(ext)) {
        return cb(
          new BadRequestException(
            `Invalid file type. Allowed: ${allowedExt.join(', ')}`,
          ),
          false,
        );
      }
      cb(null, true);
    },
  };
};
