import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";
import { FiPlus, FiMinus, FiTrash, FiX, FiCheckCircle, FiShoppingBag,FiClipboard } from "react-icons/fi";
import deliveryBoy from "../assets/images/delivery-boy.mp4";
import { API_BASE_URL } from "../config/apiConfig";

const COUPON_LIST = {
     NEOPHX10: 0.1,
     WELCOME50: 0.5,
     FESTIVE20: 0.2,
     REPUBLIC25: 0.25,
     FREEDOM20: 0.2,
     NAVRATRE15: 0.15,
     XMAS25:0.25,
     DIWALI30:0.3,
     CLASSIC10:0.1,
};


// --- Sub-Component: Cart Item (Dark Theme) ---
const CartItem = ({ item, onAdd, onRemove, onDelete, stock }) => (
     <div className="group flex items-center justify-between p-3 mb-3 bg-cyan-900/10 border border-cyan-900/30 rounded-xl hover:bg-cyan-900/20 transition-all duration-300">
          <div className="flex items-center gap-4">
               {/* Image Container */}
               <div className="w-16 h-16 flex-shrink-0 bg-white/5 rounded-lg border border-cyan-900/30 overflow-hidden flex items-center justify-center">
                    {item.image ? (
                         <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                         />
                    ) : (
                         <FiShoppingBag className="text-cyan-700 text-2xl" />
                    )}
               </div>

               {/* Details */}
               <div>
                    <h3 className="text-sm font-bold text-cyan-200 line-clamp-1">
                         {item.name || item.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                         <span className="font-medium text-white">
                              ₹{Number(item.price || 0).toLocaleString()}
                         </span>
                    </p>
                    <p
                         className={`text-[10px] mt-1 font-medium ${stock < 5 ? "text-orange-400" : "text-green-400"
                              }`}
                    >
                         {stock === 0 ? "Sold Out" : `${stock} left in stock`}
                    </p>
               </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-end gap-2">
               <button
                    onClick={onDelete}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                    title="Remove Item"
               >
                    <FiTrash size={14} />
               </button>

               <div className="flex items-center bg-[#0f0f2e] rounded-lg border border-cyan-900/40 shadow-sm h-8">
                    <button
                         onClick={onRemove}
                         className="px-2 h-full text-cyan-500 hover:bg-cyan-900/30 hover:text-red-400 rounded-l-lg transition-colors"
                    >
                         <FiMinus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-gray-200">
                         {item.quantity}
                    </span>
                    <button
                         onClick={onAdd}
                         disabled={stock <= 0}
                         className={`px-2 h-full rounded-r-lg transition-colors ${stock <= 0
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-cyan-500 hover:bg-cyan-900/30 hover:text-green-400"
                              }`}
                    >
                         <FiPlus size={12} />
                    </button>
               </div>
          </div>
     </div>
);

// --- Main Component: Order Summary ---
const OrderSummary = ({ onCheckout }) => {
     const { cart, total, addFromCart, removeFromCart, allClearFromCart } = useCart();

     const fetchProducts = async () => {
          try {
               const res = await fetch(`${API_BASE_URL}/products`);
               if (!res.ok) {
                    const txt = await res.text().catch(() => null);
                    throw new Error(`Failed to fetch products: ${res.status} ${txt ? '- ' + txt.slice(0,200) : ''}`);
               }
               const data = await res.json();
               return data;
          } catch (err) {
               console.warn('fetchProducts failed', err);
               return null;
          }
     }; 

     const [coupon, setCoupon] = useState("");
     const [appliedCoupon, setAppliedCoupon] = useState(null);
     const [message, setMessage] = useState({ text: "", type: "" });
     const [showModal, setShowModal] = useState(false);
     const [showVideo, setShowVideo] = useState(false);
     const [placedOrder, setPlacedOrder] = useState(null);
     const [syncing, setSyncing] = useState(false);
     const [syncMessage, setSyncMessage] = useState("");
     const { user: authUser } = useAuth();
     const { getStock, fetchAndSetStocks, reconcileOrder } = useStock();

     // Keep local user for display in billing section in sync with auth
     const [user, setUser] = useState({ username: "", phone: "" });

     // Keep local stock in sync for items in the cart
     useEffect(() => {
          const ids = cart.map(i => i._id).filter(Boolean);
          if (ids.length > 0) fetchAndSetStocks(ids);
     }, [cart, fetchAndSetStocks]);

     useEffect(() => {
          if (authUser) setUser({ username: authUser.username || "", phone: authUser.phone || "" });
          else setUser({ username: "", phone: "" });
     }, [authUser]);

     // Coupon Logic
     const handleApplyCoupon = () => {
          const code = coupon.toUpperCase().trim();
          if (!code) return;

          if (COUPON_LIST[code]) {
               setAppliedCoupon(code);
               setMessage({ text: `Success! ${code} applied.`, type: "success" });
          } else {
               setMessage({ text: "Invalid coupon code.", type: "error" });
               setAppliedCoupon(null);
          }
          setTimeout(() => setMessage({ text: "", type: "" }), 3000);
     };

     const handleRemoveCoupon = () => {
          setAppliedCoupon(null);
          setCoupon("");
          setMessage({ text: "", type: "" });
     };

     // Calculations
     const discount = appliedCoupon ? total * COUPON_LIST[appliedCoupon] : 0;
     const shipping = total > 0 && total - discount < 999 ? 49 : 0;
     const finalTotal = total - discount + shipping;

     const handleContinuePayment = () => {
          if (!user.username.trim() || !user.phone.trim()) {
               alert("Please Login or Signup to continue.");
               return;
          }
          setShowModal(true);
     };

     const handleConfirmBilling = async () => {
          const billingData = { user, cart, total: finalTotal };

          try {
               if (onCheckout) {
                    const result = await onCheckout(billingData);
                    if (result && result.order) {
                         console.debug('Placed order (client):', result.order);
                         setPlacedOrder(result.order);
                         // Reconcile client product information with server after placing order
                         try {
                              await fetchProducts();
                         } catch (e) {
                              console.warn('fetchProducts failed after checkout:', e);
                         }
                         setMessage({ text: `Order placed — ref ${result.order.trackingRef}`, type: "success" });
                         setShowVideo(true);
                    } else {
                         throw new Error('No order returned from server');
                    }
               }
          } catch (err) {
               console.error('Checkout error in UI:', err);
               alert('Failed to place order.');
               setShowVideo(false);
          }
     };

     const handleDevSync = async () => {
          try {
               setSyncing(true);
               setSyncMessage('Syncing...');
               const data = await fetchProducts();
               if (Array.isArray(data)) {
                    setSyncMessage(`Synced ${data.length} products`);
                    console.debug('Dev sync result:', data.length, 'products');
               } else if (data === null) {
                    setSyncMessage('Sync failed');
               } else {
                    setSyncMessage('Sync completed');
               }
          } catch (err) {
               console.error('Dev sync failed', err);
               setSyncMessage('Sync failed');
          } finally {
               setSyncing(false);
               setTimeout(() => setSyncMessage(''), 3000);
          }
     }; 

     // Copy helper: takes the text to copy (trackingRef, emailRef, etc.)
     const handleCopy = async (text) => {
          if (!text) {
               setMessage({ text: 'Nothing to copy', type: 'error' });
               setTimeout(() => setMessage({ text: '', type: '' }), 2000);
               return;
          }
          try {
               if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
               } else {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
               }
               setMessage({ text: 'Copied to clipboard', type: 'success' });
               setTimeout(() => setMessage({ text: '', type: '' }), 2000);
          } catch (err) {
               console.error('Copy failed', err);
               setMessage({ text: 'Copy failed', type: 'error' });
               setTimeout(() => setMessage({ text: '', type: '' }), 2000);
          }
     };

     const handleCloseModal = () => {
          setShowModal(false);
          setShowVideo(false);
     }; 

     return (
          <>
               {/* Dark Card Container */}
               <div className="bg-[#05051a] p-6 rounded-2xl shadow-xl border border-gray-800 sticky top-20">
                    <div className="flex items-center justify-between mb-6">
                         <h2 className="text-xl font-bold text-white flex items-center gap-2">
                              <span className="w-1 h-6 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"></span>
                              Order Summary
                         </h2>
                    </div>

                    {/* Cart List */}
                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                         {cart.length === 0 ? (
                              <div className="text-center py-8">
                                   <div className="bg-cyan-900/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-cyan-900/30">
                                        <FiShoppingBag className="text-cyan-600 text-2xl" />
                                   </div>
                                   <p className="text-gray-400 text-sm">Your cart is empty.</p>
                              </div>
                         ) : (
                              cart.map((item) => {
                                   const ctxStock = getStock(item._id);
                                   const available = ctxStock ?? item?.stock ?? item?.quantity ?? item?.qty ?? item?.available ?? 0;
                                   return (
                                        <CartItem
                                             key={item._id}
                                             item={item}
                                             stock={available}
                                             onAdd={async () => {
                                                  if ((item.quantity || 0) < available) {
                                                       const r = await addFromCart(item._id);
                                                       if (!r.ok) {
                                                            setMessage({ text: r.error || "No more stock available.", type: "error" });
                                                            setTimeout(() => setMessage({ text: "", type: "" }), 2000);
                                                       }
                                                  } else {
                                                       setMessage({ text: "No more stock available.", type: "error" });
                                                       setTimeout(() => setMessage({ text: "", type: "" }), 2000);
                                                  }
                                             }}
                                             onRemove={async () => {
                                                  if (item.quantity > 1) {
                                                       await removeFromCart(item._id);
                                                  }
                                             }}
                                             onDelete={async () => {
                                                  await allClearFromCart(item._id);
                                             }}
                                        />
                                   );
                              })
                         )}
                    </div>

                    {cart.length > 0 && (
                         <>
                              <hr className="border-dashed border-gray-700 my-6" />

                              {/* Coupon Section */}
                              <div className="mb-6">
                                   <label className="text-xs font-semibold text-cyan-500 uppercase tracking-wider mb-2 block">
                                        Promo Code
                                   </label>
                                   <div className="flex gap-2">
                                        <input
                                             type="text"
                                             value={coupon}
                                             onChange={(e) => setCoupon(e.target.value)}
                                             placeholder="Ex: hello50"
                                             disabled={!!appliedCoupon}
                                             className="flex-1 bg-[#0f0f2e] border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none p-2.5 transition-all"
                                        />
                                        {!appliedCoupon ? (
                                             <button
                                                  onClick={handleApplyCoupon}
                                                  className="px-4 py-2 bg-cyan-700 text-white text-sm font-medium rounded-lg hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-900/50"
                                             >
                                                  Apply
                                             </button>
                                        ) : (
                                             <button
                                                  onClick={handleRemoveCoupon}
                                                  className="px-4 py-2 bg-red-900/30 border border-red-900/50 text-red-400 text-sm font-medium rounded-lg hover:bg-red-900/50 transition-colors"
                                             >
                                                  Remove
                                             </button>
                                        )}
                                   </div>

                                   {/* Messages */}
                                   {message.text && (
                                        <p
                                             className={`text-xs mt-2 flex items-center gap-1 ${message.type === "success"
                                                  ? "text-green-400"
                                                  : "text-red-400"
                                                  }`}
                                        >
                                             {message.type === "success" && <FiCheckCircle />}{" "}
                                             {message.text}
                                        </p>
                                   )}
                              </div>

                              {/* Calculations */}
                              <div className="space-y-3 text-sm text-gray-400">
                                   <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-white">
                                             ₹{total.toFixed(2)}
                                        </span>
                                   </div>

                                   {discount > 0 && (
                                        <div className="flex justify-between text-green-400 bg-green-900/10 p-2 rounded-lg border border-green-900/30">
                                             <span className="flex items-center gap-1">
                                                  <FiCheckCircle size={12} /> Coupon ({appliedCoupon})
                                             </span>
                                             <span className="font-bold">- ₹{discount.toFixed(2)}</span>
                                        </div>
                                   )}

                                   <div className="flex justify-between">
                                        <span>Shipping Fee</span>
                                        <span
                                             className={
                                                  shipping === 0 ? "text-green-400 font-medium" : "text-white"
                                             }
                                        >
                                             {shipping === 0 ? "Free" : `₹${shipping}`}
                                        </span>
                                   </div>

                                   <div className="pt-4 border-t border-gray-700 mt-4 flex justify-between items-center">
                                        <span className="text-base font-bold text-gray-200">Total</span>
                                        <span className="text-xl font-bold text-cyan-400">
                                             ₹{finalTotal.toFixed(2)}
                                        </span>
                                   </div>
                              </div>

                              <button
                                   onClick={handleContinuePayment}
                                   className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-900/40 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
                              >
                                   Checkout Now
                              </button>

                              {placedOrder && (
                                   <div className="mt-4 p-4 bg-green-900/10 border border-green-900/30 rounded-lg">
                                        <p className="text-sm text-green-200 font-medium">Order confirmed!</p>
                                        <p className="text-sm text-gray-300">Tracking Ref: <strong className="text-white">{placedOrder.trackingRef}</strong></p>
                                        {placedOrder.emailRef && <p className="text-sm text-gray-300">Email Ref: <strong className="text-white">{placedOrder.emailRef}</strong></p>}
                                        <a className="text-sm text-cyan-400 underline mt-2 inline-block" href={`/orders/track/${encodeURIComponent(placedOrder.trackingRef)}`}>Track your order</a>
                                   </div>
                              )}

                              <a
                                   className="mt-5 text-cyan-500 hover:text-cyan-400 font-bold flex items-center justify-center text-sm"
                                   href="/"
                              >
                                   Return to Shopping →
                              </a>
                         </>
                    )}
               </div>

               {/* --- Checkout Modal --- */}
               {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                         {/* Backdrop */}
                         <div
                              className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                              onClick={!showVideo ? handleCloseModal : undefined}
                         ></div>

                         {/* Modal Content - Dark Theme */}
                         <div className="relative bg-[#0a0a2e] border border-cyan-900/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-fadeInUp">
                              {/* Header */}
                              {!showVideo && (
                                   <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#05051a]">
                                        <h2 className="text-lg font-bold text-cyan-100">
                                             Confirm Order
                                        </h2>
                                        <button
                                             onClick={handleCloseModal}
                                             className="text-gray-500 hover:text-white transition-colors"
                                        >
                                             <FiX size={20} />
                                        </button>
                                   </div>
                              )}

                              <div className="p-6 overflow-y-auto custom-scrollbar">
                                   {showVideo ? (
                                        // --- SUCCESS STATE (Video) ---
                                        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                                             {/* 1. Video Portal */}
                                             <div className="relative mb-6 group">
                                                  <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20"></div>
                                                  <div className="relative w-40 h-40 rounded-full border-4 border-[#0a0a2e] shadow-2xl overflow-hidden ring-4 ring-cyan-500/50">
                                                       <video
                                                            className="w-full h-full object-cover scale-125"
                                                            autoPlay
                                                            playsInline
                                                            loop
                                                       >
                                                            <source src={deliveryBoy} type="video/mp4" />
                                                       </video>
                                                  </div>
                                                  <div className="absolute bottom-1 right-1 bg-green-500 text-white p-2 rounded-full border-4 border-[#0a0a2e] shadow-lg">
                                                       <FiCheckCircle size={20} />
                                                  </div>
                                             </div>

                                             {/* 2. Text Content */}
                                             <h3 className="text-2xl font-bold text-white mb-2">
                                                  Woohoo! 🎉
                                             </h3>
                                             <p className="text-gray-400 max-w-xs mx-auto mb-4 leading-relaxed">
                                                  Your order has been placed successfully. Thank you for
                                                  choosing us!
                                             </p>
                                             <p className="text-cyan-300 font-semibold">
                                                  You will receive a confirmation email shortly.
                                             </p>

                                             {/* Show refs immediately in demo mode */}
                                             {placedOrder && (
                                                  <div className="mt-3 text-sm text-gray-300 space-y-2">
                                                       <div className="flex items-center gap-2">
                                                            <p>Tracking Ref: <strong className="text-white">{placedOrder.trackingRef}</strong></p>
                                                            <button onClick={() => handleCopy(placedOrder.trackingRef)} className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-500 hover:text-white">
                                                                 <FiClipboard size={14} />
                                                            </button>
                                                       </div>

                                                       {placedOrder.emailRef && (
                                                            <div className="flex items-center gap-2">
                                                                 <p>Email Ref: <strong className="text-white">{placedOrder.emailRef}</strong></p>
                                                                 <button onClick={() => handleCopy(placedOrder.emailRef)} className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-500 hover:text-white">
                                                                      <FiClipboard size={14} />
                                                                 </button>
                                                            </div>
                                                       )}
                                                  </div>
                                             )}

                                             {/* 3. Action Buttons */}
                                             <div className="flex items-center w-full mt-3">
                                                  <button
                                                       onClick={handleCloseModal}
                                                       className="flex-1 py-3 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                                                  >
                                                       Close
                                                  </button>
                                             </div>
                                        </div>
                                   ) : (

                                        // --- BILLING CONFIRMATION STATE ---
                                        <div className="space-y-6">
                                             {/* User Details Card */}
                                             <div className="bg-cyan-900/10 p-4 rounded-xl border border-cyan-500/20">
                                                  <p className="text-xs text-cyan-400 font-bold uppercase tracking-wide mb-2">
                                                       Billing To
                                                  </p>
                                                  <div className="flex justify-between items-center">
                                                       <div>
                                                            <p className="font-bold text-white text-lg">
                                                                 {user.username}
                                                            </p>
                                                            <p className="text-sm text-gray-400">{user.phone}</p>
                                                            <p className="text-sm text-cyan-300">
                                                                 Tracking Ref: <span className="font-medium">{placedOrder ? placedOrder.trackingRef : "Will be generated"}</span>
                                                            </p>
                                                       </div>
                                                       <div className="w-10 h-10 bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                                                            <FiCheckCircle size={20} />
                                                       </div>
                                                  </div>
                                             </div>

                                             {/* Summary List */}
                                             <div>
                                                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                                                       Items Summary
                                                  </h3>
                                                  <div className="space-y-3 bg-[#0f0f2e] p-3 rounded-xl border border-gray-800">
                                                       {cart.map((item) => (
                                                            <div
                                                                 key={item._id}
                                                                 className="flex justify-between text-sm"
                                                            >
                                                                 <div className="flex gap-2">
                                                                      <span className="font-medium text-cyan-600">
                                                                           {item.quantity}x
                                                                      </span>
                                                                      <span className="text-gray-300 line-clamp-1 max-w-[180px]">
                                                                           {item.name || item.title}
                                                                      </span>
                                                                 </div>
                                                                 <span className="font-medium text-white">
                                                                      ₹{(item.price * item.quantity).toLocaleString()}
                                                                 </span>
                                                            </div>
                                                       ))}
                                                       <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between font-bold text-white">
                                                            <span>Total Amount</span>
                                                            <span className="text-cyan-400">
                                                                 ₹{finalTotal.toLocaleString()}
                                                            </span>
                                                       </div>
                                                  </div>
                                             </div>

                                             {/* Actions */}
                                             <div className="grid grid-cols-2 gap-3 pt-2">
                                                  <button
                                                       onClick={handleCloseModal}
                                                       className="px-4 py-3 bg-transparent border border-gray-600 text-gray-300 font-semibold rounded-xl hover:bg-white/5 transition-colors"
                                                  >
                                                       Cancel
                                                  </button>
                                                  <button
                                                       onClick={handleConfirmBilling}
                                                       className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                                                  >
                                                       Pay & Confirm
                                                  </button>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               )}
          </>
     );
};



export default OrderSummary;