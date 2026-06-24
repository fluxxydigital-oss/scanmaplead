import db from './src/lib/db';

async function main() {
  const campaigns = await db.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(campaigns, null, 2));
}

main().finally(() => process.exit(0));
