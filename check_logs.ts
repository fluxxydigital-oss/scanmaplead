import db from "./src/lib/db";
async function run() {
  const s = await db.searchLog.findMany({
    where: { searchId: 'cmqfi1khc0000tguookzjs8ji' },
    orderBy: { createdAt: 'asc' }
  });
  console.log("LOGS:");
  s.forEach(l => console.log(`[${l.level}] ${l.message}`));
  process.exit(0);
}
run();
