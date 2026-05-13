import mongoose from "mongoose";

const tshirtSchema = new mongoose.Schema(
     {
          name: { type: String, required: true, trim: true },
          brand: { type: String, default: "" },
          gender: { type: String, enum: ["Men", "Women", "Unisex"], default: "Unisex" },
          sizeOptions: [{ type: String }], // e.g. ["S", "M", "L", "XL"]
          colorOptions: [{ type: String }],
          material: { type: String, default: "" },
          fit: { type: String, default: "" },
          pattern: { type: String, default: "" },
          sleeve: { type: String, default: "" },
          category: {
               type: String,
               enum: ["t-shirt"],
               default: "t-shirt",
          },
          description: { type: String },
          price: { type: Number, required: true },
          oldPrice: { type: Number },
          discount: { type: Number, default: 0 },
          stock: { type: Number, default: 0 },

          rating: { type: Number, default: 0, min: 0, max: 5 },
          reviews: [
               {
                    user: { type: String },
                    comment: { type: String },
                    rating: { type: Number, min: 1, max: 5 },
                    date: { type: Date, default: Date.now },
               },
          ],

          image: { type: String },
          gallery: [{ type: String }],

          deliveryInfo: { type: String, default: "Delivered in 3–5 business days" },
          returnPolicy: { type: String, default: "7 Days Replacement Policy" },
          offerTags: [{ type: String }],
     },
     { timestamps: true }
);

export default mongoose.model("TShirt", tshirtSchema);
