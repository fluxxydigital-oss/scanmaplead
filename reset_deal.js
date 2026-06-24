const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.lead.updateMany({
    data: { dealValue: 0 }
  });
  console.log('Reset ' + result.count + ' leads to dealValue = 0');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
