import React, { useState } from "react";
import { useCart } from "../context/CartContext"; 
import { FiPlus, FiMinus, FiTrash } from "react-icons/fi";
import BillingForm from "./BillingFrom";
import OrderSummary from "./OrderSummary";
import PaymentDetails from "./PaymentDetails";

/* --------------------------------------
   Radio Inputs
-------------------------------------- */

const RadioOption = ({ id, name, label, sublabel, defaultChecked = false }) => (
     <div className="flex items-center">
          <input
               id={id}
               name={name}
               type="radio"
               defaultChecked={defaultChecked}
               className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-cyan-500 accent-teal-600"
          />
          <label htmlFor={id} className="ml-3 block text-sm">
               <span className="font-medium text-cyan-300">{label}</span>
               {sublabel && <span className="block text-xs text-gray-600">{sublabel}</span>}
          </label>
     </div>
);

/* --------------------------------------
   Delivery Options
-------------------------------------- */

const DeliveryOptions = () => (
     <div className="bg-[#05051a]  border border-gray-800  p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <span className="w-1 h-6 bg-green-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"></span>
               Delivery address
          </h2>
          <div className="space-y-3">
               <RadioOption id="delivery-same" name="delivery" label="Same address" defaultChecked />
               <RadioOption id="delivery-different" name="delivery" label="Different address" />
          </div>
     </div>
);

export default function CheckoutPage() {
     const { cart, clearCart } = useCart();

     const handleCheckout = async (billingData) => {
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

               const res = await fetch(`/api/users/${loggedInUser.id}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
               });

               const data = await res.json();
               console.debug("Checkout response:", res.status, data);
               if (!res.ok) throw new Error(data.message || 'Order failed');

               // Clear cart locally
               clearCart();

               // Return created order to caller (OrderSummary)
               return { order: data.order };
          } catch (err) {
               console.error('Checkout error:', err.message || err);
               alert('Failed to place order. Please try again.');
               throw err;
          }
     };

     return (
          <div className="min-h-screen  bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a2e] via-[#020617] to-[#05051a] text-gray-100 pt-20 mt-3">
               <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight flex justify-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                         Checkout
                    </span>
               </h2>
               <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto mb-8"></div>
               <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-7">
                    <div className="lg:col-span-2 space-y-6">
                         <BillingForm />
                         <DeliveryOptions />
                         <PaymentDetails />
                    </div>

                    <div className="lg:col-span-1">
                         <OrderSummary onCheckout={handleCheckout} />
                    </div>
               </div>
          </div>
     );
}
