// React imports for context + state management
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from './AuthContext';
import { useStock } from './StockContext';


// Create a context for Cart
const CartContext = createContext();

// Custom hook to access Cart context easily
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
     const { user } = useAuth();

     // Load cart from localStorage on first render (robust parsing)
     const [cart, setCart] = useState(() => {
          try {
               const saved = localStorage.getItem("cart");
               return saved ? JSON.parse(saved) : [];
          } catch (_) {
               // ignore localStorage parsing failures
               return [];
          }

     });

     // ⛅ Keep cart saved in localStorage whenever it changes (guarded)
     useEffect(() => {
          try {
               localStorage.setItem("cart", JSON.stringify(cart));
          } catch {
               // ignore localStorage write failures
          }



     }, [cart]);

     // Remote cart helpers (no automatic sync). Use these manually when you need to fetch or persist cart on the server.
     const fetchRemoteCart = async (uid) => {
          if (!uid && user?.id) uid = user.id;
          if (!uid) return null;
          try {
               const res = await fetch(`/api/users/${uid}/cart`);
               if (!res.ok) return null;
               const data = await res.json();
               const normalized = (data.cart || []).map(c => ({ ...c.product, quantity: c.quantity }));
               return normalized;
          } catch (err) {
               console.error('fetchRemoteCart failed:', err);
               return null;
          }
     };

     const saveRemoteCart = async (uid, cartToSave) => {
          if (!uid && user?.id) uid = user.id;
          if (!uid) return false;
          try {
               const payload = (cartToSave || cart).map(item => ({ product: item._id, quantity: item.quantity }));
               const res = await fetch(`${apiBase}/users/${uid}/cart`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cart: payload })
               });
               return res.ok;
          } catch (err) {
               console.error('saveRemoteCart failed:', err);
               return false;
          }
     };

     // Merge remote cart into local cart (strategy: 'preferLocal' adds quantities, 'preferRemote' overwrites local quantities)
     const mergeRemoteCart = async (uid, strategy = 'preferLocal') => {
          const remote = await fetchRemoteCart(uid);
          if (!remote) return false;
          const mergedMap = new Map();

          // Add local items first
          cart.forEach(i => mergedMap.set(i._id, { ...i }));

          // Merge remote
          remote.forEach(i => {
               const id = i._id;
               if (mergedMap.has(id)) {
                    if (strategy === 'preferRemote') {
                         mergedMap.set(id, { ...i });
                    } else {
                         const local = mergedMap.get(id);
                         mergedMap.set(id, { ...local, quantity: (local.quantity || 0) + (i.quantity || 0) });
                    }
               } else {
                    mergedMap.set(id, { ...i });
               }
          });

          setCart(Array.from(mergedMap.values()));
          return true;
     };

     // NOTE: Automatic fetching/saving of cart to server was removed to prevent unintended overwrites/duplication of cart items.
     // Use fetchRemoteCart(), saveRemoteCart(uid) or mergeRemoteCart(uid) explicitly when needed.

     // When user logs out, clear cart from UI and localStorage so checkout data is not visible after logout
     useEffect(() => {
          if (!user) {
               // If a logged-in user logs out, release any reserved stock held in the cart
               (async () => {
                    try {
                         await releaseAllFromCart();
                    } catch {
                         // ignore release failures on logout
                    }

                    try {
                         localStorage.removeItem('cart');
                    } catch (e) {
                         // ignore
                    }
               })();
          }
     }, [user]);

     // -------------------------
     // Reservation helpers (talk to backend)
     // -------------------------
     const { adjustStock, setStock } = useStock();
     const apiBase = (import.meta.env.VITE_API_URL?.trim() || 'https://techkart-ava8.onrender.com/api').replace(/\/+$/, '');


     const reserveProduct = async (id, qty = 1) => {
          try {
               const res = await fetch(`${apiBase}/products/${id}/reserve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: qty })
               });
               const data = await res.json();
               if (!res.ok) {
                    // Make sure callers can display the real backend message
                    const msg = data?.message || data?.error || 'Reserve failed';
                    throw new Error(msg);
               }
               if (data && typeof data.stock === 'number') setStock(id, data.stock);
               else adjustStock(id, -qty);
               return { ok: true, stock: data && data.stock };
          } catch (err) {
               console.error('reserveProduct failed', err);
               return { ok: false, error: err?.message || String(err) };
          }
     };


     const releaseProduct = async (id, qty = 1) => {
          try {
               const res = await fetch(`${apiBase}/products/${id}/release`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: qty })
               });
               const data = await res.json();
               if (!res.ok) throw new Error(data.message || 'Release failed');
               if (data && typeof data.stock === 'number') setStock(id, data.stock);
               else adjustStock(id, qty);
               return { ok: true, stock: data && data.stock };
          } catch (err) {
               console.error('releaseProduct failed', err);
               return { ok: false, error: err.message || String(err) };
          }
     };

     // -------------------------
     // 🚀 Add product to cart
     // If exists → increase quantity (reservation performed)
     // If new → add with quantity = 1 (reservation performed)
     // -------------------------
     const addToCart = async (product) => {
          if (!product || !product._id) return { ok: false, error: 'Invalid product' };

          const r = await reserveProduct(product._id, 1);
          if (!r.ok) return { ok: false, error: r.error || 'Insufficient stock' };

          setCart((prev) => {
               const exists = prev.find((item) => item._id === product._id);

               if (exists) {
                    return prev.map((item) =>
                         item._id === product._id
                              ? { ...item, quantity: item.quantity + 1 }
                              : item
                    );
               }

               return [...prev, { ...product, quantity: 1 }];
          });

          return { ok: true };
     };

     // ➕ Increase quantity from cart page (+ button)
     const addFromCart = async (id) => {
          const r = await reserveProduct(id, 1);
          if (!r.ok) return { ok: false, error: r.error };

          setCart((prev) =>
               prev.map((item) =>
                    item._id === id
                         ? { ...item, quantity: item.quantity + 1 }
                         : item
               )
          );
          return { ok: true };
     };

     // ➖ Decrease quantity from cart page (– button)
     // If quantity becomes 0 → remove item (release reservation)
     const removeFromCart = async (id) => {
          // release one unit on server
          try {
               const r = await releaseProduct(id, 1);
               if (!r.ok) console.warn('release failed when removing from cart', r.error);
          } catch (err) {
               console.warn('release call failed', err);
          }

          setCart((prev) =>
               prev
                    .map((item) =>
                         item._id === id
                              ? { ...item, quantity: item.quantity - 1 }
                              : item
                    )
                    .filter((item) => item.quantity > 0)
          );
          return { ok: true };
     };

     // ❌ Remove a single product completely
     const allClearFromCart = async (id) => {
          const item = cart.find(i => i._id === id);
          if (item) {
               try {
                    const r = await releaseProduct(id, item.quantity || 0);
                    if (!r.ok) console.warn('release failed when clearing', r.error);
               } catch (err) {
                    console.warn('release call failed', err);
               }
          }

          setCart((prev) => prev.filter((item) => item._id !== id));
          return { ok: true };
     };

     // 🛒 Remove all items at once (used after successful checkout — do NOT release reserved stock)
     const clearCart = () => setCart([]);

     // Release reservations for all items then clear (use when user explicitly empties cart)
     const releaseAllFromCart = async () => {
          const items = [...cart];
          for (const it of items) {
               if (!it || !it._id) continue;
               const qty = it.quantity || 0;
               if (qty > 0) {
                    try {
                         const r = await releaseProduct(it._id, qty);
                         if (!r.ok) console.warn('releaseAllFromCart: failed for', it._id, r.error);
                    } catch (err) {
                         console.warn('releaseAllFromCart error', err);
                    }
               }
          }
          setCart([]);
     };

     // 💰 Calculate total price of entire cart
     const total = cart.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
     );

     return (
          <CartContext.Provider
               value={{
                    cart,
                    addToCart,
                    addFromCart,
                    removeFromCart,
                    allClearFromCart,
                    clearCart,
                    reserveProduct,
                    releaseProduct,
                    total,
                    // manual helpers — no automatic server sync is performed
                    fetchRemoteCart,
                    saveRemoteCart,
                    mergeRemoteCart,
                    releaseAllFromCart,
               }}
          >
               {children}
          </CartContext.Provider>
     );
};
