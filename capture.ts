import puppeteer from "puppeteer";
import * as path from "path";

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    // Use widescreen viewport size
    await page.setViewport({ width: 2560, height: 1080 });
    
    console.log("Navigating to http://localhost:3000/searches/mock-id...");
    await page.goto("http://localhost:3000/searches/mock-id", {
      waitUntil: "networkidle2",
      timeout: 10000
    });

    // Wait for a second to ensure animations settle
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const screenshotPath = path.resolve(
      "C:/Users/Leo/.gemini/antigravity/brain/ce9718db-338d-4e3b-9d67-04ee9dec4ffd/media__search_results_verify.png"
    );
    console.log(`Taking screenshot and saving to: ${screenshotPath}`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log("Screenshot saved successfully!");
  } catch (err) {
    console.error("Error capturing screenshot:", err);
  } finally {
    await browser.close();
  }
}

main();
