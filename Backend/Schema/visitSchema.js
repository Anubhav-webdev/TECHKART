import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
     {
          userId: {
               type: String,
               default: "guest",
               index: true,
          },
          username: {
               type: String,
               default: "",
          },
          page: {
               type: String,
               default: "/",
          },
          pageTitle: {
               type: String,
               default: "",
          },
          durationSeconds: {
               type: Number,
               default: 0,
          },
          location: {
               type: String,
               default: "Unknown",
          },
          locationSource: {
               type: String,
               default: "unavailable",
          },
          city: {
               type: String,
               default: "",
          },
          country: {
               type: String,
               default: "",
          },
          ipAddress: {
               type: String,
               default: "",
          },
          userAgent: {
               type: String,
               default: "",
          },
          visitedAt: {
               type: Date,
               default: Date.now,
               index: true,
          },
     },
     { timestamps: true }
);

export const Visit = mongoose.model("Visit", visitSchema);
