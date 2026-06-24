import db from './src/lib/db';
async function main() {
  const users = await db.user.findMany();
  console.log(users);
}
main();
