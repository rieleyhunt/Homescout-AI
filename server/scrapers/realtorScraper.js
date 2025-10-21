
import puppeteer from "puppeteer";
import Listing from "../models/Listing.js";

export async function scrapeRealtor(location, maxDistance, minPrice = 0, maxPrice = 9999999) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const searchUrl = `https://www.realtor.ca/map#ZoomLevel=10&Center=45.4215:-75.6992&PropertyTypeGroupID=1&Sort=6-A&view=list&GeoIds=g%3A${location}`;
    await page.goto(searchUrl, { waitUntil: "networkidle2" });

    let pageNum = 1;
    let hasNext = true;
    const listings = [];
    while (hasNext && pageNum <= 5) {
        await page.waitForSelector(".listingCard", { timeout: 10000 });
        const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll(".listingCard a"));
        const urls = anchors.map(a => a.href).filter(url => url.includes("/real-estate/"));
        return [...new Set(urls)];
    });
    
        for (const url of links) {
            try {
                const detailPage = await browser.newPage();
                await detailPage.goto(url, { waitUntil: "networkidle2" });
                
                const data = await detailPage.evaluate(() => {
                    const body = document.body.innerText;
                    return { title, price, address, body };
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