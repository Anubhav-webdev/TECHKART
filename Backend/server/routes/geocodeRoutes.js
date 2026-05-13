import express from "express";
import axios from "axios";

const router = express.Router();

// GET /api/geocode?lat=<>&lng=<> - uses Google Maps Geocoding API to reverse geocode
router.get("/", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "Missing lat or lng query parameter" });

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "Google Maps API key not configured on server" });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${encodeURIComponent(apiKey)}`;

    const response = await axios.get(url, { timeout: 8000 });
    const data = response.data;

    if (data.status !== "OK" || !Array.isArray(data.results) || data.results.length === 0) {
      return res.status(502).json({ message: "Geocoding failed", details: data.status });
    }

    // Pick the most relevant result (first) and extract components
    const primary = data.results[0];
    const components = primary.address_components || [];

    const findType = (type) => {
      const comp = components.find((c) => (c.types || []).includes(type));
      return comp ? comp.long_name : null;
    };

    const city = findType("locality") || findType("postal_town") || findType("administrative_area_level_2") || findType("administrative_area_level_1") || "";
    const state = findType("administrative_area_level_1") || "";
    const postal = findType("postal_code") || "";
    const area = findType("neighborhood") || findType("sublocality") || findType("route") || "";
    const full = primary.formatted_address || "";

    return res.json({ city, state, postal, area, full });
  } catch (err) {
    console.error("/api/geocode error:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
