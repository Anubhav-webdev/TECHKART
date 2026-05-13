import express from "express";
import axios from "axios";

const router = express.Router();

// GET /api/news
// Accepts query params: q (search query) OR topic, lang, max
// Uses NEWS_API_KEY1 and NEWS_API_KEY2 from env and falls back on key2 if key1 fails
router.get("/", async (req, res) => {
  try {
    const { q, topic, lang = "en", max = 4, country } = req.query;

    const apiUrl = "https://gnews.io/api/v4/search";

    const params = {};
    if (q) params.q = q;
    if (topic) params.topic = topic;
    if (lang) params.lang = lang;
    if (country) params.country = country;
    params.max = Number(max) || 4;

    const key1 = process.env.NEWS_API_KEY1;
    const key2 = process.env.NEWS_API_KEY2;

    if (!key1 && !key2) {
      console.error("❌ News API keys not configured");
      return res.status(500).json({ message: "News API keys not configured on the server." });
    }

    // Try with key1 then fallback to key2 if needed
    let response;
    let lastError = null;

    if (key1) {
      try {
        console.log("📰 Trying News API with key1, params:", JSON.stringify(params));
        response = await axios.get(apiUrl, { params: { ...params, token: key1 }, timeout: 10000 });
        console.log("✅ News API success with key1");
      } catch (err) {
        console.warn("⚠️ News API key1 failed:", err.message);
        lastError = err;
      }
    }

    if (!response && key2) {
      try {
        console.log("📰 Trying News API with key2, params:", JSON.stringify(params));
        response = await axios.get(apiUrl, { params: { ...params, token: key2 }, timeout: 10000 });
        console.log("✅ News API success with key2");
      } catch (err) {
        console.warn("⚠️ News API key2 failed:", err.message);
        lastError = err;
      }
    }

    if (!response) {
      const errMsg = lastError?.response?.data?.message || lastError?.message || "Unknown error";
      console.error("❌ News API fetch failed:", errMsg);
      return res.status(502).json({ message: "Failed to fetch news from provider", error: errMsg });
    }

    res.status(200).json(response.data);
  } catch (err) {
    console.error("/api/news error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
