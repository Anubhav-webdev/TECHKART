import mongoose from "mongoose";

// Billing schema
const billingSchema = new mongoose.Schema(
     {
          userId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User",
               required: true,
          },
          billingType: {
               type: String,
               enum: ["individual", "company"],
               default: "individual",
          },
          Name: { type: String },
          email: { type: String },
          phone: { type: String },
          address: { type: String, required: true },
          country: { type: String, required: true },
          city: { type: String, required: true },
          state: { type: String, required: true },
          zip: { type: String, required: true },
          saveToAddressList: { type: Boolean, default: false },
     },
     { timestamps: true }
);

// ✅ Auto-fill user details before saving
billingSchema.pre("save", async function (next) {
     try {
          // Run only when new document or userId is changed
          if (!this.isModified("userId")) return next();

          const User = mongoose.model("User");
          const user = await User.findById(this.userId);

          if (!user) {
               return next(new Error("User not found with provided userId"));
          }

          // Fill only if missing
          if (!this.email) this.email = user.email;
          if (!this.phone) this.phone = user.phone;

          if (user.username) {
               const parts = user.username.split(" ");
               this.Name = parts[0] || this.Name;   // First name
          }

          next();
     } catch (err) {
          next(err);
     }
});


export default mongoose.model("Billing", billingSchema);
