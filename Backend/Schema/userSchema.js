import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
     username: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
          unique: true,
          index: true
     },
     email: {
          type: String,
          unique: true,
          required: true,
          lowercase: true
     },
     phone: {
          type: String,
          required: true
     },
     fullName: { type: String, default: "" },
     avatar: { type: String, default: "" },
     birthday: { type: Date },
     password: {
          type: String,
          required: true
     },
     role: {
          type: String,
          enum: ["user", "admin"],
          default: "user"
     },
     // New fields for persistence
     wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
     cart: [
          {
               product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
               quantity: { type: Number, default: 1 }
          }
     ],
     orders: [
          {
               items: [
                    {
                         product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                         quantity: { type: Number, default: 1 },
                         price: { type: Number, required: true },
                         name: { type: String },
                         title: { type: String }
                    }
               ],
               billing: { type: Object },
               total: { type: Number, required: true },
               status: { type: String, default: "placed" },
               trackingRef: { type: String },
               emailRef: { type: String },
               emailSent: { type: Boolean, default: false },
               createdAt: { type: Date, default: Date.now }
          }
     ],
     addresses: [
          {
               label: { type: String },
               address: { type: String },
               city: { type: String },
               state: { type: String },
               zip: { type: String },
               country: { type: String },
               phone: { type: String },
               billingType: { type: String, enum: ["home", "work", "billing", "other"], default: "home" }
          }
     ],
     paymentMethods: [
          {
               type: { type: String }, // card, paypal, etc.
               brand: { type: String },
               last4: { type: String },
               expMonth: { type: Number },
               expYear: { type: Number },
               cardId: { type: String }
          }
     ]
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
     if (!this.isModified("password")) return next();
     this.password = await bcrypt.hash(this.password, 10);
     next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidate) {
     return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);
