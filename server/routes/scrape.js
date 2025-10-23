import express from "express";
import { scrapeRealtor } from "../scrapers/realtorScraper.js";
const router = express.Router();


router.get("/realtor-scrape", async (req, res) => {
    const { location, maxDistance, minPrice, maxPrice } = req.query;
    try {
        const results = await scrapeRealtor(location, maxDistance, minPrice, maxPrice);
        res.json({ listings: results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed scrape" });
    }
});

export default router;