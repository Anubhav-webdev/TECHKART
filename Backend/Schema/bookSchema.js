import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
     {
          title: { type: String, required: true, trim: true },
          author: { type: String, required: true, trim: true },
          publisher: { type: String, default: "" },
          language: { type: String, default: "English" },
          pages: { type: Number, default: 0 },
          genre: { type: String, default: "" },
          edition: { type: String, default: "" },
          isbn: { type: String, unique: true, sparse: true },

          // ✅ keep category consistent with backend detection
          category: {
               type: String,
               enum: ["book"],
               default: "book",
          },

          description: { type: String },
          price: { type: Number, required: true },
          oldPrice: { type: Number, default: 0 },
          discount: { type: Number, default: 0 },
          stock: { type: Number, default: 0 },

          rating: { type: Number, default: 0, min: 0, max: 5 },
          reviews: [
               {
                    user: { type: String, trim: true },
                    comment: { type: String, trim: true },
                    rating: { type: Number, min: 1, max: 5 },
                    date: { type: Date, default: Date.now },
               },
          ],

          image: { type: String },
          gallery: [{ type: String }],

          deliveryInfo: {
               type: String,
               default: "Delivered in 3–5 business days",
          },
          returnPolicy: {
               type: String,
               default: "7 Days Replacement Policy",
          },
          offerTags: [{ type: String }],
     },
     { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
