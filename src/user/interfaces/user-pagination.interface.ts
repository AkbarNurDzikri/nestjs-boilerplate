import { Prisma } from '@prisma/client';

export const userInclude = {
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
} satisfies Prisma.UserInclude;

export type IUserWithRoles = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

export type ISanitizedUser = Omit<IUserWithRoles, 'password' | 'roles'> & {
  roles: { id: string; name: string }[];
};
