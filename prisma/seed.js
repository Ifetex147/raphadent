require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@raphadent.com' },
    update: {},
    create: {
      email: 'admin@raphadent.com',
      password: hashedPassword,
      name: 'Dr. Admin',
      role: 'ADMIN',
      phone: '+2348012345678',
    },
  });

  const dentistPassword = await bcrypt.hash('dentist123', 10);
  await prisma.user.upsert({
    where: { email: 'dentist@raphadent.com' },
    update: {},
    create: {
      email: 'dentist@raphadent.com',
      password: dentistPassword,
      name: 'Dr. Chukwu',
      role: 'DENTIST',
      phone: '+2348012345679',
    },
  });

  const receptionistPassword = await bcrypt.hash('reception123', 10);
  await prisma.user.upsert({
    where: { email: 'reception@raphadent.com' },
    update: {},
    create: {
      email: 'reception@raphadent.com',
      password: receptionistPassword,
      name: 'Ada Reception',
      role: 'RECEPTIONIST',
      phone: '+2348012345680',
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin:       admin@raphadent.com / admin123');
  console.log('  Dentist:     dentist@raphadent.com / dentist123');
  console.log('  Reception:   reception@raphadent.com / reception123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });