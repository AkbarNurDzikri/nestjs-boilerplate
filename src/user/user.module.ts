import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FileService } from 'src/shared/services/file.service';

@Module({
  controllers: [UserController],
  providers: [UserService, FileService],
  exports: [UserService],
})
export class UserModule {}
