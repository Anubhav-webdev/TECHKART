import React, { useState } from "react";
import { useCart } from "../context/CartContext"; 
import { FiPlus, FiMinus, FiTrash, FiArrowRight, FiArrowLeft, FiCheck } from "react-icons/fi";
import BillingForm from "./BillingFrom";
import OrderSummary from "./OrderSummary";
import PaymentDetails from "./PaymentDetails";
import { API_BASE_URL } from "../config/apiConfig";

export default function CheckoutPage() {
     const { cart, clearCart } = useCart();
     const [billingFormData, setBillingFormData] = useState(null);
     const [billingFormValid, setBillingFormValid] = useState(false);

     // Wizard Step Tracker for Mobile (1 = Billing, 2 = Payment, 3 = Summary)
     const [currentStep, setCurrentStep] = useState(1);

     const handleBillingUpdate = ({ formData, isValid }) => {
          setBillingFormData(formData || null);
          setBillingFormValid(Boolean(isValid));
     };

     const handleCheckout = async (billingData) => {
          if (!billingFormValid || !billingFormData?.address?.trim()) {
               alert("Please complete your billing address before checkout.");
               setCurrentStep(1); // Drop mobile user back to step 1 if invalid
               throw new Error("Billing address required");
          }
          const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
          if (!loggedInUser || !loggedInUser.id) {
               alert("Please Login or Signup to continue.");
               return;
          }

          try {
               const payload = {
                    items: cart.map(item => ({ product: item._id, quantity: item.quantity, price: item.price })),
                    billing: billingData.user,
                    total: billingData.total
               };

               const url = `${API_BASE_URL}/users/${loggedInUser.id}/orders`;

               const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
               });

               const text = await res.text();
               let data = {};
               try {
                    data = text ? JSON.parse(text) : {};
               } catch (parseErr) {
                    console.error('Failed to parse JSON response:', text, parseErr);
                    throw new Error(`Invalid server response: ${text.substring(0, 100)}`);
               }

               if (!res.ok) throw new Error(data.message || `Server error: ${res.status}`);

               clearCart();
               return { order: data.order };
          } catch (err) {
               console.error('Checkout error:', err.message || err);
               alert(`Order failed: ${err.message}`);
               throw err;
          }
     };

     return (
          <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a2e] via-[#020617] to-[#05051a] text-gray-100 pt-20 mt-3 px-4 sm:px-6">
               <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight flex justify-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                         Checkout
                    </span>
               </h2>
               <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto mb-8"></div>
               
               {/* --------------------------------------
                   DESKTOP VIEW (Unchanged original grid layout)
               -------------------------------------- */}
               <div className="hidden lg:grid max-w-7xl mx-auto grid-cols-3 gap-7">
                    <div className="lg:col-span-2 space-y-6">
                         <BillingForm onFormUpdate={handleBillingUpdate} />
                         <PaymentDetails />
                    </div>
                    <div className="lg:col-span-1">
                         <OrderSummary onCheckout={handleCheckout} billingReady={billingFormValid} />
                    </div>
               </div>

               {/* --------------------------------------
                   MOBILE WIZARD VIEW (Triggered below 'lg')
               -------------------------------------- */}
               <div className="block lg:hidden max-w-xl mx-auto space-y-6">
                    
                    {/* Visual Progress Indicator Dots */}
                    <div className="flex items-center justify-center space-x-4 mb-4">
                         <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${currentStep >= 1 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-gray-400'}`}>
                              {currentStep > 1 ? <FiCheck size={16} /> : "1"}
                         </div>
                         <div className={`h-0.5 w-12 ${currentStep >= 2 ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                         <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${currentStep >= 2 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-gray-400'}`}>
                              {currentStep > 2 ? <FiCheck size={16} /> : "2"}
                         </div>
                         <div className={`h-0.5 w-12 ${currentStep >= 3 ? 'bg-cyan-500' : 'bg-slate-800'}`} />
                         <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${currentStep === 3 ? 'bg-purple-500 text-white' : 'bg-slate-800 text-gray-400'}`}>
                              3
                         </div>
                    </div>

                    {/* Step Containers */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md min-h-[300px]">
                         {currentStep === 1 && (
                              <div className="space-y-4">
                                   <h3 className="text-xl font-bold text-cyan-300 mb-2">Billing Address</h3>
                                   <BillingForm onFormUpdate={handleBillingUpdate} />
                                   
                                   <div className="pt-4 flex justify-end">
                                        <button
                                             disabled={!billingFormValid}
                                             onClick={() => setCurrentStep(2)}
                                             className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-gray-500 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all w-full sm:w-auto justify-center"
                                        >
                                             Continue to Payment <FiArrowRight />
                                        </button>
                                   </div>
                              </div>
                         )}

                         {currentStep === 2 && (
                              <div className="space-y-4">
                                   <h3 className="text-xl font-bold text-cyan-300 mb-2">Payment Details</h3>
                                   <PaymentDetails />
                                   
                                   <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-between">
                                        <button
                                             onClick={() => setCurrentStep(1)}
                                             className="flex items-center gap-2 border border-slate-700 hover:bg-slate-800 text-gray-300 font-medium px-5 py-3 rounded-xl transition-all justify-center"
                                        >
                                             <FiArrowLeft /> Back
                                        </button>
                                        <button
                                             onClick={() => setCurrentStep(3)}
                                             className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all justify-center"
                                        >
                                             Review Order <FiArrowRight />
                                        </button>
                                   </div>
                              </div>
                         )}

                         {currentStep === 3 && (
                              <div className="space-y-4">
                                   <h3 className="text-xl font-bold text-purple-300 mb-2">Review Your Order</h3>
                                   <OrderSummary onCheckout={handleCheckout} billingReady={billingFormValid} />
                                   
                                   <div className="pt-2">
                                        <button
                                             onClick={() => setCurrentStep(2)}
                                             className="flex items-center gap-2 text-sm border border-slate-800 hover:bg-slate-800 text-gray-400 font-medium px-4 py-2 rounded-lg transition-all mx-auto"
                                        >
                                             <FiArrowLeft /> Change Payment/Address
                                        </button>
                                   </div>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}