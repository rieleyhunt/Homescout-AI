
import puppeteer from "puppeteer";

export async function scrapeRealtor(location, maxDistance, minPrice = 0, maxPrice = 9999999) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const searchUrl = `https://www.realtor.ca/map#ZoomLevel=10&Center=45.4215:-75.6992&PropertyTypeGroupID=1&Sort=6-A&view=list&GeoIds=g%3A${location}`;
    
    await page.waitForSelector(".listingCard")
}