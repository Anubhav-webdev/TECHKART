import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import frameQR from "../assets/images/frame.png";

// --------------------------------------------------------
// Reusable Radio Option (Dark Theme)
// --------------------------------------------------------
const RadioOption = ({ id, name, label, sublabel, checked, onChange }) => (
     <div className="flex items-center">

          <input

               id={id}

               name={name}

               type="radio"

               checked={checked}

               onChange={onChange}

               className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-cyan-500 accent-teal-600"

          />

          <label htmlFor={id} className="ml-3 block text-sm cursor-pointer">

               <span className="font-medium text-cyan-300">{label}</span>

               {sublabel && (

                    <span className="block text-xs text-gray-200">{sublabel}</span>

               )}

          </label>

     </div>
);

// Animation preset
const fade = {
     hidden: { opacity: 0, y: -10 },
     visible: { opacity: 1, y: 0 },
     exit: { opacity: 0, y: -10 },
};

const PaymentDetails = () => {
     const [payment, setPayment] = useState("payment-card");

     // Saved demo cards (placeholder state kept for structure)
     const [selectedSavedCard, setSelectedSavedCard] = useState(null);

     // Card Input Fields + Validation
     const [cardFields, setCardFields] = useState({
          cardNumber: "",
          cardName: "",
          expiry: "",
          cvv: "",
     });

     const [errors, setErrors] = useState({});

     const handleCardChange = (e) => {
          const { name, value } = e.target;
          setCardFields((prev) => ({ ...prev, [name]: value }));
     };

     // Validation Function
     const validateCard = () => {
          let newErrors = {};

          if (!/^\d{16}$/.test(cardFields.cardNumber.replace(/\s/g, ""))) {
               newErrors.cardNumber = "Enter a valid 16-digit card number";
          }

          if (cardFields.cardName.trim().length < 3) {
               newErrors.cardName = "Name is too short";
          }

          if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardFields.expiry)) {
               newErrors.expiry = "Expiry must be MM/YY";
          }

          if (!/^\d{3}$/.test(cardFields.cvv)) {
               newErrors.cvv = "Invalid CVV";
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     };

     // UPI Validation
     const [upiId, setUpiId] = useState("");
     const [upiError, setUpiError] = useState("");

     const validateUPI = () => {
          if (!/^[a-zA-Z0-9.\-_]{3,}@[a-zA-Z]{2,}$/.test(upiId)) {
               setUpiError("Enter valid UPI ID (example: name@upi)");
               return false;
          }
          setUpiError("");
          return true;
     };

     // Auto Fill from Saved Card logic (if needed in future)
     const handleSavedCardSelect = (card) => {
          setSelectedSavedCard(card.id);
          setCardFields({
               cardNumber: card.number.replace(/\*/g, "•"),
               cardName: card.name,
               expiry: card.expiry,
               cvv: "",
          });
     };

     return (
          <div className="bg-[#05051a] p-6 rounded-2xl shadow-xl border border-gray-800">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"></span>
                    Payment details
               </h2>

               {/* Payment Options */}
               <div className="space-y-3">
                    <RadioOption
                         id="payment-card"
                         name="payment"
                         label="Online with card"
                         checked={payment === "payment-card"}
                         onChange={() => setPayment("payment-card")}
                    />

                    <RadioOption
                         id="payment-upi"
                         name="payment"
                         label="UPI Payment"
                         sublabel="Google Pay • PhonePe • Paytm"
                         checked={payment === "payment-upi"}
                         onChange={() => setPayment("payment-upi")}
                    />

                    <RadioOption
                         id="payment-installments"
                         name="payment"
                         label="NeoPhoenix EMI"
                         sublabel="1% interest per month"
                         checked={payment === "payment-installments"}
                         onChange={() => setPayment("payment-installments")}
                    />

                    <RadioOption
                         id="payment-cash"
                         name="payment"
                         label="Cash on delivery"
                         checked={payment === "payment-cash"}
                         onChange={() => setPayment("payment-cash")}
                    />
               </div>

               {/* ============================================================
          CARD PAYMENT SECTION
      ============================================================= */}
               <AnimatePresence>
                    {payment === "payment-card" && (
                         <motion.div
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={fade}
                              className="mt-6 space-y-4 bg-cyan-900/10 p-4 rounded-xl border border-cyan-500/20"
                         >
                              {/* Card Form */}
                              <div>
                                   <label className="block text-sm font-medium text-cyan-200/80 mb-1">
                                        Card Number
                                   </label>
                                   <input
                                        type="text"
                                        name="cardNumber"
                                        value={cardFields.cardNumber}
                                        onChange={handleCardChange}
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full bg-[#0f0f2e] border border-gray-700 text-white placeholder-gray-500 rounded-lg p-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all shadow-inner"
                                   />
                                   {errors.cardNumber && (
                                        <p className="text-xs text-red-400 mt-1">{errors.cardNumber}</p>
                                   )}
                              </div>

                              <div>
                                   <label className="block text-sm font-medium text-cyan-200/80 mb-1">
                                        Name on Card
                                   </label>
                                   <input
                                        type="text"
                                        name="cardName"
                                        value={cardFields.cardName}
                                        onChange={handleCardChange}
                                        placeholder="John Doe"
                                        className="w-full bg-[#0f0f2e] border border-gray-700 text-white placeholder-gray-500 rounded-lg p-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all shadow-inner"
                                   />
                                   {errors.cardName && (
                                        <p className="text-xs text-red-400 mt-1">{errors.cardName}</p>
                                   )}
                              </div>

                              <div className="flex gap-4">
                                   <div className="flex-1">
                                        <label className="block text-sm font-medium text-cyan-200/80 mb-1">
                                             Expiry
                                        </label>
                                        <input
                                             type="text"
                                             name="expiry"
                                             value={cardFields.expiry}
                                             onChange={handleCardChange}
                                             placeholder="MM/YY"
                                             className="w-full bg-[#0f0f2e] border border-gray-700 text-white placeholder-gray-500 rounded-lg p-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all shadow-inner"
                                        />
                                        {errors.expiry && (
                                             <p className="text-xs text-red-400 mt-1">{errors.expiry}</p>
                                        )}
                                   </div>

                                   <div className="flex-1">
                                        <label className="block text-sm font-medium text-cyan-200/80 mb-1">
                                             CVV
                                        </label>
                                        <input
                                             type="password"
                                             name="cvv"
                                             value={cardFields.cvv}
                                             onChange={handleCardChange}
                                             maxLength={3}
                                             placeholder="123"
                                             className="w-full bg-[#0f0f2e] border border-gray-700 text-white placeholder-gray-500 rounded-lg p-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all shadow-inner"
                                        />
                                        {errors.cvv && (
                                             <p className="text-xs text-red-400 mt-1">{errors.cvv}</p>
                                        )}
                                   </div>
                              </div>

                              <button
                                   onClick={validateCard}
                                   className="w-full mt-3 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all active:scale-[0.98]"
                              >
                                   Validate Card
                              </button>
                         </motion.div>
                    )}
               </AnimatePresence>

               {/* ============================================================
          UPI SECTION
      ============================================================= */}
               <AnimatePresence>
                    {payment === "payment-upi" && (
                         <motion.div
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={fade}
                              className="mt-6 space-y-4 bg-cyan-900/10 p-4 rounded-xl border border-cyan-500/20"
                         >
                              <div>
                                   <label className="block text-sm font-medium text-cyan-200/80 mb-1">
                                        Enter UPI ID
                                   </label>
                                   <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="yourname@upi"
                                        className="w-full bg-[#0f0f2e] border border-gray-700 text-white placeholder-gray-500 rounded-lg p-2.5 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all shadow-inner"
                                   />
                                   {upiError && (
                                        <p className="text-xs text-red-400 mt-1">{upiError}</p>
                                   )}
                              </div>

                              <div className="text-sm text-gray-400 font-medium text-center border-t border-gray-700 pt-3 mt-2">
                                   OR Scan QR Code (Demo)
                              </div>

                              <div className="w-40 h-40 bg-white p-2 rounded-lg mx-auto flex items-center justify-center shadow-lg border-4 border-[#0f0f2e]">
                                   <img
                                        src={frameQR}
                                        alt="QR Code"
                                        className="w-full h-full object-contain"
                                   />
                              </div>

                              <button
                                   onClick={validateUPI}
                                   className="w-full mt-3 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all active:scale-[0.98]"
                              >
                                   Validate UPI
                              </button>
                         </motion.div>
                    )}
               </AnimatePresence>
          </div>
     );
};

export default PaymentDetails;