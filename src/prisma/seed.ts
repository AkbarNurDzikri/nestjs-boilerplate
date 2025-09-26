import { Prisma, PrismaClient } from '@prisma/client';
import { PERMISSIONS } from '../common/constants/permissions.constants';
import * as argon from 'argon2';
import { faker } from '@faker-js/faker';

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

  await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' },
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

  const usersToCreate = 50;
  console.log(`Creating ${usersToCreate} additional users with Faker...`);

  const usersData: Prisma.UserCreateManyInput[] = [];

  for (let i = 0; i < usersToCreate; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const email = faker.internet.email({
      firstName,
      lastName,
      provider: 'test.com',
    });
    const password = faker.internet.password();

    // Pastikan kita hanya menambahkan properti yang valid untuk createMany
    usersData.push({
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: await argon.hash(password),
      isActive: true,
    });
  }

  // Menggunakan createMany untuk performa yang lebih baik
  const createdUsers = await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true,
  });

  console.log(`Created ${createdUsers.count} new users.`);

  // Dapatkan kembali user yang baru dibuat untuk dihubungkan ke role
  const newUsers = await prisma.user.findMany({
    where: {
      email: {
        in: usersData.map((u) => u.email),
      },
    },
  });

  // Ambil role 'user'
  const roleUser = await prisma.role.findFirst({
    where: { name: 'user' },
  });

  if (!roleUser) {
    throw new Error("Role 'user' not found. Please ensure it is seeded first.");
  }

  // Membuat data untuk userRole secara massal
  const userRolesData: Prisma.UserRoleCreateManyInput[] = newUsers.map((u) => ({
    userId: u.id,
    roleId: roleUser.id,
  }));

  // Menggunakan createMany untuk userRole
  const createdUserRoles = await prisma.userRole.createMany({
    data: userRolesData,
    skipDuplicates: true,
  });

  console.log(`Assigned role 'user' to ${createdUserRoles.count} users.`);
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
