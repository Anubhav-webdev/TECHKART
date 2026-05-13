// React imports for context + state management
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useStock } from "./StockContext";

// Create Cart Context
const CartContext = createContext();

// Custom Hook
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
     const { user } = useAuth();

     // Backend API Base URL
     const API =
          import.meta.env.VITE_API_URL?.trim() ||
          "https://techkart-ava8.onrender.com/api";

     // Load cart from localStorage
     const [cart, setCart] = useState(() => {
          try {
               const saved = localStorage.getItem("cart");
               return saved ? JSON.parse(saved) : [];
          } catch (err) {
               console.warn("Cart parse error:", err);
               return [];
          }
     });

     // Save cart to localStorage
     useEffect(() => {
          try {
               localStorage.setItem("cart", JSON.stringify(cart));
          } catch (err) {
               console.warn("Cart save error:", err);
          }
     }, [cart]);

     // Stock Context
     const { adjustStock, setStock } = useStock();

     // =========================
     // RESERVE PRODUCT
     // =========================
     const reserveProduct = async (id, qty = 1) => {
          try {
               const res = await fetch(`${API}/products/${id}/reserve`, {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                         quantity: qty,
                    }),
               });

               // Read response safely
               const text = await res.text();

               console.log("Reserve Response:", text);

               let data = {};

               try {
                    data = text ? JSON.parse(text) : {};
               } catch (err) {
                    console.error("Invalid JSON:", text);

                    return {
                         ok: false,
                         error: "Server returned invalid response",
                    };
               }

               // Handle failed response
               if (!res.ok) {
                    return {
                         ok: false,
                         error: data.message || "Reserve failed",
                    };
               }

               // Update stock
               if (typeof data.stock === "number") {
                    setStock(id, data.stock);
               } else {
                    adjustStock(id, -qty);
               }

               return {
                    ok: true,
                    stock: data.stock,
               };
          } catch (err) {
               console.error("reserveProduct failed:", err);

               return {
                    ok: false,
                    error: err.message || "Server error",
               };
          }
     };

     // =========================
     // RELEASE PRODUCT
     // =========================
     const releaseProduct = async (id, qty = 1) => {
          try {
               const res = await fetch(`${API}/products/${id}/release`, {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                         quantity: qty,
                    }),
               });

               // Safe response parsing
               const text = await res.text();

               console.log("Release Response:", text);

               let data = {};

               try {
                    data = text ? JSON.parse(text) : {};
               } catch (err) {
                    console.error("Invalid JSON:", text);

                    return {
                         ok: false,
                         error: "Server returned invalid response",
                    };
               }

               if (!res.ok) {
                    return {
                         ok: false,
                         error: data.message || "Release failed",
                    };
               }

               // Update stock
               if (typeof data.stock === "number") {
                    setStock(id, data.stock);
               } else {
                    adjustStock(id, qty);
               }

               return {
                    ok: true,
                    stock: data.stock,
               };
          } catch (err) {
               console.error("releaseProduct failed:", err);

               return {
                    ok: false,
                    error: err.message || "Server error",
               };
          }
     };

     // =========================
     // ADD TO CART
     // =========================
     const addToCart = async (product) => {
          if (!product || !product._id) {
               return {
                    ok: false,
                    error: "Invalid product",
               };
          }

          // Reserve stock first
          const reserve = await reserveProduct(product._id, 1);

          if (!reserve.ok) {
               return {
                    ok: false,
                    error: reserve.error || "Insufficient stock",
               };
          }

          // Add product to cart
          setCart((prev) => {
               const exists = prev.find(
                    (item) => item._id === product._id
               );

               if (exists) {
                    return prev.map((item) =>
                         item._id === product._id
                              ? {
                                     ...item,
                                     quantity: item.quantity + 1,
                                }
                              : item
                    );
               }

               return [
                    ...prev,
                    {
                         ...product,
                         quantity: 1,
                    },
               ];
          });

          return {
               ok: true,
          };
     };

     // =========================
     // INCREASE QUANTITY
     // =========================
     const addFromCart = async (id) => {
          const reserve = await reserveProduct(id, 1);

          if (!reserve.ok) {
               return {
                    ok: false,
                    error: reserve.error,
               };
          }

          setCart((prev) =>
               prev.map((item) =>
                    item._id === id
                         ? {
                                ...item,
                                quantity: item.quantity + 1,
                           }
                         : item
               )
          );

          return {
               ok: true,
          };
     };

     // =========================
     // DECREASE QUANTITY
     // =========================
     const removeFromCart = async (id) => {
          try {
               await releaseProduct(id, 1);
          } catch (err) {
               console.warn("Release failed:", err);
          }

          setCart((prev) =>
               prev
                    .map((item) =>
                         item._id === id
                              ? {
                                     ...item,
                                     quantity: item.quantity - 1,
                                }
                              : item
                    )
                    .filter((item) => item.quantity > 0)
          );

          return {
               ok: true,
          };
     };

     // =========================
     // REMOVE COMPLETE PRODUCT
     // =========================
     const allClearFromCart = async (id) => {
          const item = cart.find((i) => i._id === id);

          if (item) {
               await releaseProduct(id, item.quantity || 0);
          }

          setCart((prev) =>
               prev.filter((item) => item._id !== id)
          );

          return {
               ok: true,
          };
     };

     // =========================
     // CLEAR CART
     // =========================
     const clearCart = () => {
          setCart([]);
     };

     // =========================
     // RELEASE ALL CART STOCK
     // =========================
     const releaseAllFromCart = async () => {
          const items = [...cart];

          for (const item of items) {
               if (!item?._id) continue;

               const qty = item.quantity || 0;

               if (qty > 0) {
                    await releaseProduct(item._id, qty);
               }
          }

          setCart([]);
     };

     // =========================
     // CLEAR CART ON LOGOUT
     // =========================
     useEffect(() => {
          if (!user) {
               (async () => {
                    try {
                         await releaseAllFromCart();
                    } catch (err) {
                         console.warn("Release all failed:", err);
                    }

                    localStorage.removeItem("cart");
               })();
          }
     }, [user]);

     // =========================
     // TOTAL PRICE
     // =========================
     const total = cart.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
     );

     return (
          <CartContext.Provider
               value={{
                    cart,
                    total,
                    addToCart,
                    addFromCart,
                    removeFromCart,
                    allClearFromCart,
                    clearCart,
                    reserveProduct,
                    releaseProduct,
                    releaseAllFromCart,
               }}
          >
               {children}
          </CartContext.Provider>
     );
};