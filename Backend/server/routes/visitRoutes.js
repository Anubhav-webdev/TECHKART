import express from "express";
import { Visit } from "../../Schema/visitSchema.js";

const router = express.Router();

const getClientIp = (req) => {
     const forwarded = req.headers["x-forwarded-for"];
     const rawIp = Array.isArray(forwarded)
          ? forwarded[0]
          : forwarded || req.socket.remoteAddress || "";

     return rawIp.toString().split(",")[0].trim().replace(/^::ffff:/, "");
};

const resolveLocationFromIp = async (ipAddress) => {
     if (!ipAddress) return null;

     try {
          const res = await fetch(`https://ipapi.co/${encodeURIComponent(ipAddress)}/json/`, {
               headers: { Accept: "application/json" },
          });

          if (!res.ok) throw new Error("Location lookup failed");

          const data = await res.json();
          const parts = [data.city, data.region, data.country_name || data.country].filter(Boolean);

          return {
               location: parts.join(", ") || "Unknown",
               city: data.city || "",
               country: data.country_name || data.country || "",
          };
     } catch (error) {
          console.warn("IP location lookup failed:", error.message);
          return null;
     }
};

router.post("/track", async (req, res) => {
     try {
          const {
               userId,
               username,
               page,
               pageTitle,
               location,
               city,
               country,
               ipAddress,
               userAgent,
               durationSeconds,
          } = req.body;

          const normalizedUserId = String(userId || "").trim();
          if (!normalizedUserId || normalizedUserId === "guest") {
               return res.status(200).json({
                    success: true,
                    message: "Guest visits are not tracked",
                    visit: null,
               });
          }

          const clientIp = ipAddress || getClientIp(req);
          const resolvedLocation = location ? null : await resolveLocationFromIp(clientIp);
          const locationSource = location ? "provided" : resolvedLocation ? "ipapi" : "unavailable";
          const normalizedDuration = Math.max(0, Number(durationSeconds) || 0);

          const visit = await Visit.create({
               userId: normalizedUserId,
               username: username || "",
               page: page || "/",
               pageTitle: pageTitle || "",
               durationSeconds: normalizedDuration,
               location: location || resolvedLocation?.location || "Unknown",
               city: city || resolvedLocation?.city || "",
               country: country || resolvedLocation?.country || "",
               locationSource,
               ipAddress: clientIp,
               userAgent: userAgent || "",
          });

          return res.status(201).json({
               success: true,
               message: "Visit recorded",
               visit,
          });
     } catch (error) {
          console.error("TRACK ERROR:", error);
          return res.status(500).json({
               success: false,
               message: "Failed to track visit",
               error: error.message,
          });
     }
});

router.get("/summary", async (req, res) => {
     try {
          const { userId } = req.query;
          if (!userId) {
               return res.status(400).json({
                    success: false,
                    message: "A userId is required",
               });
          }

          const visits = await Visit.find({ userId: String(userId) })
               .sort({ visitedAt: -1 })
               .limit(50)
               .lean();

          const totalDurationSeconds = visits.reduce((total, visit) => total + Number(visit.durationSeconds || 0), 0);
          const latestVisit = visits[0] || null;

          return res.status(200).json({
               success: true,
               summary: {
                    userId: String(userId),
                    totalDurationSeconds,
                    totalPages: visits.length,
                    lastVisit: latestVisit?.visitedAt || null,
                    lastPage: latestVisit?.page || "/",
                    lastLocation: latestVisit?.location || "Unknown",
                    locationSource: latestVisit?.locationSource || "unavailable",
               },
          });
     } catch (error) {
          console.error("VISIT SUMMARY ERROR:", error);
          return res.status(500).json({
               success: false,
               message: "Failed to fetch visit summary",
               error: error.message,
          });
     }
});

router.get("/history", async (req, res) => {
     try {
          const { userId } = req.query;
          const limit = Math.min(200, Number(req.query.limit || 200));
          const filter = userId ? { userId: String(userId) } : {};

          const visits = await Visit.find(filter)
               .sort({ visitedAt: -1 })
               .limit(limit)
               .lean();

          return res.status(200).json({
               success: true,
               visits,
          });
     } catch (error) {
          console.error("VISIT HISTORY ERROR:", error);
          return res.status(500).json({
               success: false,
               message: "Failed to fetch visit history",
               error: error.message,
          });
     }
});

export default router;
