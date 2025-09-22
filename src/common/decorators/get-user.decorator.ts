import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtUser } from 'src/auth/types/jwt-user.interface';

export const GetUser = createParamDecorator(
  (
    data: keyof IJwtUser | undefined,
    ctx: ExecutionContext,
  ): IJwtUser | IJwtUser[keyof IJwtUser] => {
    const req = ctx.switchToHttp().getRequest<{ user: IJwtUser }>();
    const user = req.user;
    return data ? user?.[data] : user;
  },
);
