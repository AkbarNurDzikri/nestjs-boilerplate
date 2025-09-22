import { PrismaClient } from '@prisma/client';
import { PERMISSIONS } from '../common/constants/permissions.constants';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'erp.blasfolie@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'erp.blasfolie@gmail.com',
      password: await argon.hash('rahasia'),
      isActive: true,
    },
  });

  const role = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  const permissions: { name: string; description: string }[] = [];

  // flatten PERMISSIONS jadi array
  Object.values(PERMISSIONS).forEach((resource) => {
    Object.values(resource).forEach((perm) => {
      permissions.push({
        name: perm.name,
        description: perm.description,
      });
    });
  });

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }

  const allPermissions = await prisma.permission.findMany();

  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: perm.id,
      },
    });
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: role.id,
    },
  });
}

main()
  .then(() => {
    console.log('Seeding success');
  })
  .catch((e) => {
    console.error('Seeding failed', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
