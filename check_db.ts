import db from "./src/lib/db";
async function run() {
  const s = await db.search.findMany({
    where: { status: { in: ['STARTING_BROWSER', 'SEARCHING_MAPS', 'SAVING_LEADS'] } }
  });
  console.log("ACTIVE SEARCHES:");
  console.log(JSON.stringify(s, null, 2));
  
  if (s.length > 0) {
    await db.search.updateMany({
      where: { status: { in: ['STARTING_BROWSER', 'SEARCHING_MAPS', 'SAVING_LEADS'] } },
      data: { status: 'CANCELLED' }
    });
    console.log("CANCELED THEM.");
  }
  process.exit(0);
}
run();
