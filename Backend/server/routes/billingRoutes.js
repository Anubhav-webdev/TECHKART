import express from "express";
import Billing from "../../Schema/billingSchema.js";

const router = express.Router();

// Add billing address
router.post("/add", async (req, res) => {
     try {
          const { userId, address, country, city, state, zip, billingType, saveToAddressList } = req.body;

          if (!userId) return res.status(400).json({ message: "userId is required" });
          if (!address || !country || !city || !state || !zip)
               return res.status(400).json({ message: "All address fields are required" });

          const billing = await Billing.create({
               userId,
               billingType,
               address,
               country,
               city,
               state,
               zip,
               saveToAddressList,
          });

          res.status(201).json({ message: "Billing address added successfully", billing });
     } catch (err) {
          console.error("❌ Error adding billing:", err);
          res.status(500).json({ message: "Error adding billing", error: err.message });
     }
});

router.get("/:userId", async (req, res) => {
     try {
          const bills = await Billing.find({ userId: req.params.userId }).sort({ createdAt: -1 });
          res.status(200).json(bills);
     } catch (err) {
          res.status(500).json({ message: "Error fetching billing data", error: err.message });
     }
});

router.put("/update/:id", async (req, res) => {
     try {
          const updated = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true });
          if (!updated) return res.status(404).json({ message: "Billing record not found" });
          res.status(200).json({ message: "Billing updated successfully", updated });
     } catch (err) {
          res.status(500).json({ message: "Error updating billing", error: err.message });
     }
});

router.delete("/delete/:id", async (req, res) => {
     try {
          const deleted = await Billing.findByIdAndDelete(req.params.id);
          if (!deleted) return res.status(404).json({ message: "Billing record not found" });
          res.status(200).json({ message: "Billing address deleted successfully" });
     } catch (err) {
          res.status(500).json({ message: "Error deleting billing", error: err.message });
     }
});

export default router;
