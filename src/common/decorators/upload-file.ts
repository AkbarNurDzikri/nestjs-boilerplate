import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IMulterConfig, multerConfig } from 'src/shared/configs/multer-config';

export function UploadFile(
  fieldName: string = 'file',
  options?: Partial<IMulterConfig>,
) {
  const config = multerConfig(options ?? {});
  return applyDecorators(UseInterceptors(FileInterceptor(fieldName, config)));
}
