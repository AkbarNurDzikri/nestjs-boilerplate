import { Module } from '@nestjs/common';
import { SingleUserController } from './controllers/single.user.controller';
import { FileService } from 'src/common/helpers/services/file/file.service';
import { PaginationService } from 'src/common/helpers/services/pagination/pagination.service';
import { UserList } from './services/list.user.service';
import { SingleUser } from './services/single.user.service';
import { UpdateUser } from './services/update.user.service';
import { UpdateUserController } from './controllers/update.user.controller';
import { ListUserController } from './controllers/list.user.controller';

@Module({
  controllers: [SingleUserController, UpdateUserController, ListUserController],
  providers: [FileService, PaginationService, UserList, SingleUser, UpdateUser],
})
export class UserModule {}
