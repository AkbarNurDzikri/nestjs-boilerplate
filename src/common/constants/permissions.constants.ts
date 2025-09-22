export const PERMISSIONS = {
  USER: {
    read: {
      name: 'user.read',
      description: 'melihat detail user',
    },
    update: {
      name: 'user.update',
      description: 'mengupdate user',
    },
    list: {
      name: 'user.list',
      description: 'melihat semua user',
    },
  },
  ROLE: {
    create: {
      name: 'role.create',
      description: 'membuat role',
    },
    read: {
      name: 'role.read',
      description: 'melihat detail role',
    },
    update: {
      name: 'role.update',
      description: 'mengupdate role',
    },
    delete: {
      name: 'role.delete',
      description: 'menghapus role',
    },
    list: {
      name: 'role.list',
      description: 'melihat semua role',
    },
  },
  PERMISSION: {
    create: {
      name: 'permission.create',
      description: 'membuat nama izin akses',
    },
    list: {
      name: 'permission.list',
      description: 'melihat seluruh izin akses',
    },
    read: {
      name: 'permission.read',
      description: 'melihat detail izin akses',
    },
    update: {
      name: 'permission.update',
      description: 'merubah nama izin akses',
    },
    delete: {
      name: 'permission.delete',
      description: 'menghapus nama izin akses',
    },
  },
  ROLE_PERMISSION: {
    toggle: {
      name: 'role-permission.toggle',
      description: 'menambahkan/menghapus izin ke suatu role',
    },
    list: {
      name: 'role-permission.list',
      description: 'melihat semua pasangan role dan permission',
    },
    read: {
      name: 'role-permission.read',
      description: 'melihat semua permission yang dimiliki oleh role tertentu',
    },
  },
  USER_ROLE: {
    toggle: {
      name: 'user-role.toggle',
      description: 'menambahkan/menghapus role ke seorang user',
    },
    read: {
      name: 'user-role.read',
      description: 'melihat semua role yang dimiliki user',
    },
    list: {
      name: 'user-role.list',
      description: 'melihat semua pasangan user dan role',
    },
  },
  SESSION: {
    deleteExpired: {
      name: 'session.delete-expired',
      description: 'menghapus semua sesi yang sudah expired',
    },
    revoke: {
      name: 'session.revoke',
      description: 'menghapus sesi berdasarkan id sesi',
    },
    list: {
      name: 'session.list',
      description: 'melihat semua sesi yang aktif saat ini',
    },
    logoutMe: {
      name: 'session.logout-all-devices',
      description: 'mengeluarkan akun tertentu dari semua perangkat',
    },
  },
};
