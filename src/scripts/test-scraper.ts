import { runInstagramScraper } from '../lib/scraper';

(async () => {
  console.log("Testando scraper do Instagram...");
  try {
    await runInstagramScraper(
      "site:instagram.com Nutricionistas Rio de Janeiro wa.me",
      {
        maxLeads: 20,
        headless: true
      }
    );
    console.log("Scrape finalizado.");
  } catch (error) {
    console.error("Erro no teste:", error);
  }
  process.exit(0);
})();
