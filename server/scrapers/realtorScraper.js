import puppeteer from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import Properties from "../models/Listing.js";

export async function scrapeRealtor(province, city) {
  await Properties.deleteMany({});
  console.log("Cleared all existing listings from the database");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no--sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--no-zygote",
      "--disable-dev-shm-usage",
    ],
    protocolTimeout: 60000,
  });

  // ---- CREATE POOL ----
  const CONCURRENCY = 2;
  const pool = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    const newPage = await browser.newPage();
    await setupPage(newPage);
    await newPage.emulate({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
    });
    pool.push(newPage);
  }

  async function setupPage(page) {
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["image", "stylesheet", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }
  const page = await browser.newPage();
  await setupPage(page);
  await page.emulate({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });
  const searchUrl = `https://www.realtor.ca/${province}/${city}/real-estate`;
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

  let pageNum = 1;
  let hasNext = true;

  while (hasNext) {
    console.log("on page number: " + pageNum);
    console.log(`location: ${city}, ${province}`);
    try {
      await page.waitForSelector(".listingCard", { timeout: 10000 });
    } catch (err) {
      if (err.name === "TimeoutError") {
        // TODO, SEND AN ERROR MESSAGE CANNOT FIND LOCATION
      } else {
        throw err;
      }
    }
    await page.waitForSelector(".listingCardIconCon");

    await page.waitForFunction(() => {
      const firstCard = document.querySelector(".listingCard");
      if (!firstCard) return false;

      const labels = firstCard.querySelectorAll(".listingCardIconText");
      return (
        labels.length > 0 &&
        Array.from(labels).some((l) => l.innerText.trim() !== "")
      );
    });

    const cards = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".listingCard")).map(
        (card) => {
          // URL
          const url = card.querySelector("a")?.href || null;

          // Price
          const price =
            card.querySelector(".listingCardPrice")?.innerText?.trim() || null;

          // Extract each row containing icon + label (Bedrooms, Bathrooms, Sq ft)
          const info = Array.from(
            card.querySelectorAll(".listingCardIconCon")
          ).map((row) => {
            const value =
              row.querySelector(".listingCardIcon")?.innerText?.trim() || null;
            const label =
              row.querySelector(".listingCardIconText")?.innerText?.trim() ||
              null;
            return { label, value };
          });

          const bedrooms =
            info.find((i) => i.label?.toLowerCase().includes("bed"))?.value ||
            null;

          const bathrooms =
            info.find((i) => i.label?.toLowerCase().includes("bath"))?.value ||
            null;

          const square_feet =
            info.find((i) => i.label?.toLowerCase().includes("square"))
              ?.value || null;

          return {
            url,
            price,
            bedrooms,
            bathrooms,
            square_feet,
          };
        }
      );
    });
    console.log(cards);

    // for (const url of links) {
    //     console.log("Analyzing page " + pageNum + " for URL: " + url);
    //     try {
    //         const detailPage = await browser.newPage();
    //         await setupPage(detailPage);
    //         await detailPage.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    //         const data = await detailPage.evaluate(() => {
    //             const body = document.body.innerText;
    //             return body;
    //         });

    //         data.url = url;
    //         listings.push(data);
    //         await Listing.create(data);

    //         await detailPage.close();
    //     } catch (err) {
    //         console.error("Error scraping listings:", url, err.message);
    //     }
    // }

    const nextButton = await page.$(
      'button[aria-label*="next" i], a[aria-label*="next" i]'
    );
    if (nextButton) {
      console.log("Found next button");
      await page.evaluate((el) => el.click(), nextButton);
      // await nextButton.click();
      pageNum++;
    } else {
      hasNext = false;
    }
  }

  await browser.close();
  console.log("Finished scraping");
  return "Success!";
}
