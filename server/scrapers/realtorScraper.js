
import puppeteer from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import Listing from "../models/Listing.js";


export async function scrapeRealtor(province, city, minPrice, maxPrice) {
    const browser = await puppeteer.launch({ headless: true, args: ["no--sandbox", "--disable-setuid-sandbox"], });

    async function setupPage(page) {
        await page.setRequestInterception(true);
            page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });
    }
    const page = await browser.newPage();
    await setupPage(page);

    await page.emulate({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        viewport: { width: 1280, height: 800 },
    });
    const searchUrl = `https://www.realtor.ca/${province}/${city}/real-estate`;
    await page.goto(searchUrl, { waitUntil: "networkidle2" });

    let pageNum = 1;
    let hasNext = true;
    const listings = [];
    while (hasNext && pageNum <= 5) {
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
        console.log("Listings loaded successfully");
        const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll(".listingCard a"));
        const urls = anchors.map(a => a.href).filter(url => url.includes("/real-estate/"));
        return [...new Set(urls)];
    });
    
        for (const url of links) {
            console.log("Analyzing page " + pageNum + " for URL: " + url);
            try {
                const detailPage = await browser.newPage();
                await setupPage(detailPage);
                await detailPage.goto(url, { waitUntil: "networkidle2" });
                
                const data = await detailPage.evaluate(() => {
                    const body = document.body.innerText;
                    return body;
                });

                data.url = url;
                listings.push(data);
                await Listing.create(data);

                await detailPage.close();
            } catch (err) {
                console.error("Error scraping listings:", url, err.message);
            }
        }

        const nextButton = await page.$('button[aria-label*="next" i], a[aria-label*="next" i]');
        if (nextButton) {
            await nextButton.click();
            await page.waitForTimeout(3000);
            pageNum++;
        } else {
            hasNext = false;
        }
    }

    await browser.close();
    console.log("Finished scraping");
    return listings;
}