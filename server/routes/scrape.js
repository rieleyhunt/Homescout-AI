import express from "express";
import { scrapeRealtor } from "../scrapers/realtorScraper.js";
const router = express.Router();

router.post("/realtor-scrape", async (req, res) => {
  const { province, city, maxDistance, minPrice, maxPrice } = req.body;
  try {
    const results = await scrapeRealtor(province, city);
    res.json({ listings: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed scrape" });
  }
});

export default router;
