import { PrismaClient } from "@prisma/client";
import { Queue } from "bullmq";
import { redisConnection } from "./src/lib/redis";
import { QUEUE_NAME } from "./src/lib/queue";

const prisma = new PrismaClient();
const searchQueue = new Queue(QUEUE_NAME, { connection: redisConnection });

async function hardCancel() {
  // Empty BullMQ Queue
  await searchQueue.obliterate({ force: true });
  console.log("Fila BullMQ esvaziada e apagada.");

  // Cancel all active in DB
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
  console.log(`Cancelados ${updated.count} processos no banco.`);
}

hardCancel().catch(console.error).finally(() => {
  prisma.$disconnect();
  searchQueue.close();
  process.exit(0);
});
