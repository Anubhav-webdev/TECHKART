import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
     {
          name: { type: String, required: true, trim: true },
          brand: { type: String, default: "" },
          category: {
               type: String,
               enum: ["mobile", "laptop", "gadget"],
               required: true,
          },
          featured: { type: Boolean, default: false },
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
          gallery: [{ type: String }], // multiple product images

          specifications: {
               ram: { type: String, default: "" },
               storage: { type: String, default: "" },
               processor: { type: String, default: "" },
               battery: { type: String, default: "" },
               display: { type: String, default: "" },
               camera: { type: String, default: "" },
               os: { type: String, default: "" },
               warranty: { type: String, default: "1 Year Warranty" },
               type: { type: String, default: "" },
               connectivity: { type: String, default: "" },
               features: { type: String, default: "" },

          },

          deliveryInfo: { type: String, default: "Delivered in 3–5 business days" },
          returnPolicy: { type: String, default: "7 Days Replacement Policy" },
          offerTags: [{ type: String }], // e.g. “Best Seller”, “Limited Offer”

     },
     { timestamps: true }
);

export default mongoose.model("Product", productSchema);




