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
          location: {
               type: String,
               default: "Unknown",
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
