import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cancelPending() {
  const updated = await prisma.search.updateMany({
    where: {
      status: { 
        in: [
          "PENDING", 
          "STARTING_BROWSER", 
          "SEARCHING_MAPS", 
          "COLLECTING_CARDS", 
          "OPENING_PLACES", 
          "SAVING_LEADS"
        ] 
      }
    },
    data: { status: "CANCELLED" }
  });
  console.log(`Cancelados ${updated.count} processos.`);
}

cancelPending().catch(console.error).finally(() => prisma.$disconnect());
