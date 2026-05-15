// React imports for context + state management
import React, {
     createContext,
     useContext,
     useState,
     useEffect,
} from "react";

import { useAuth } from "./AuthContext";
import { useStock } from "./StockContext";

// ========================================
// CREATE CONTEXT
// ========================================
const CartContext = createContext();

// ========================================
// CUSTOM HOOK
// ========================================
export const useCart = () => useContext(CartContext);

// ========================================
// PROVIDER
// ========================================
export const CartProvider = ({ children }) => {
     const { user } = useAuth();

     const { adjustStock, setStock } = useStock();

     // ========================================
     // SAFE API URL
     // ========================================
     const RAW_API =
          import.meta.env.VITE_API_URL?.trim() ||
          "https://techkart-ava8.onrender.com/api";

     const API = RAW_API.endsWith("/api")
          ? RAW_API
          : `${RAW_API}/api`;

     // ========================================
     // CART STATE
     // ========================================
     const [cart, setCart] = useState(() => {
          try {
               const saved = localStorage.getItem("cart");

               return saved ? JSON.parse(saved) : [];
          } catch (err) {
               console.warn("Cart parse error:", err);

               return [];
          }
     });

     // ========================================
     // SAVE CART
     // ========================================
     useEffect(() => {
          try {
               localStorage.setItem(
                    "cart",
                    JSON.stringify(cart)
               );
          } catch (err) {
               console.warn("Cart save error:", err);
          }
     }, [cart]);

     // ========================================
     // RESERVE PRODUCT
     // ========================================
     const reserveProduct = async (id, qty = 1) => {
          try {
               const url = `${API}/products/${id}/reserve`;

               console.log("Reserve URL:", url);

               const res = await fetch(url, {
                    method: "POST",
                    headers: {
                         "Content-Type":
                              "application/json",
                    },
                    body: JSON.stringify({
                         quantity: qty,
                    }),
               });

               const text = await res.text();

               console.log(
                    "Reserve Response:",
                    text
               );

               let data = {};

               try {
                    data = text
                         ? JSON.parse(text)
                         : {};
               } catch (err) {
                    console.error(
                         "Invalid JSON:",
                         text
                    );

                    return {
                         ok: false,
                         error:
                              "Server returned invalid response",
                    };
               }

               // FAILED RESPONSE
               if (!res.ok) {
                    return {
                         ok: false,
                         error:
                              data.message ||
                              "Reserve failed",
                    };
               }

               // UPDATE STOCK
               if (
                    typeof data.stock ===
                    "number"
               ) {
                    setStock(id, data.stock);
               } else {
                    adjustStock(id, -qty);
               }

               return {
                    ok: true,
                    stock: data.stock,
               };
          } catch (err) {
               console.error(
                    "reserveProduct failed:",
                    err
               );

               return {
                    ok: false,
                    error:
                         err.message ||
                         "Server error",
               };
          }
     };

     // ========================================
     // RELEASE PRODUCT
     // ========================================
     const releaseProduct = async (id, qty = 1) => {
          try {
               const url = `${API}/products/${id}/release`;

               console.log("Release URL:", url);

               const res = await fetch(url, {
                    method: "POST",
                    headers: {
                         "Content-Type":
                              "application/json",
                    },
                    body: JSON.stringify({
                         quantity: qty,
                    }),
               });

               const text = await res.text();

               console.log(
                    "Release Response:",
                    text
               );

               let data = {};

               try {
                    data = text
                         ? JSON.parse(text)
                         : {};
               } catch (err) {
                    console.error(
                         "Invalid JSON:",
                         text
                    );

                    return {
                         ok: false,
                         error:
                              "Server returned invalid response",
                    };
               }

               if (!res.ok) {
                    return {
                         ok: false,
                         error:
                              data.message ||
                              "Release failed",
                    };
               }

               // UPDATE STOCK
               if (
                    typeof data.stock ===
                    "number"
               ) {
                    setStock(id, data.stock);
               } else {
                    adjustStock(id, qty);
               }

               return {
                    ok: true,
                    stock: data.stock,
               };
          } catch (err) {
               console.error(
                    "releaseProduct failed:",
                    err
               );

               return {
                    ok: false,
                    error:
                         err.message ||
                         "Server error",
               };
          }
     };

     // ========================================
     // ADD TO CART
     // ========================================
     const addToCart = async (product) => {
          if (!product || !product._id) {
               return {
                    ok: false,
                    error: "Invalid product",
               };
          }

          // Reserve stock first
          const reserve =
               await reserveProduct(
                    product._id,
                    1
               );

          if (!reserve.ok) {
               return {
                    ok: false,
                    error:
                         reserve.error ||
                         "Insufficient stock",
               };
          }

          // Add product to local state
          setCart((prev) => {
               const exists = prev.find(
                    (item) =>
                         item._id === product._id
               );

               if (exists) {
                    return prev.map((item) =>
                         item._id ===
                         product._id
                              ? {
                                     ...item,
                                     quantity:
                                          item.quantity +
                                          1,
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

          // Save to backend if logged in
          if (user && user.id) {
               try {
                    await fetch(
                         `${API}/users/${user.id}/cart`,
                         {
                              method: "PUT",
                              headers: {
                                   "Content-Type":
                                        "application/json",
                              },
                              body: JSON.stringify({
                                   productId: product._id,
                                   quantity: 1,
                              }),
                         }
                    );
               } catch (err) {
                    console.warn(
                         "Failed to save cart to server:",
                         err.message
                    );
               }
          }

          return {
               ok: true,
          };
     };

     // ========================================
     // INCREASE QUANTITY
     // ========================================
     const addFromCart = async (id) => {
          const reserve =
               await reserveProduct(id, 1);

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
                                quantity:
                                     item.quantity + 1,
                           }
                         : item
               )
          );

          // Update on backend if logged in
          if (user && user.id) {
               try {
                    await fetch(
                         `${API}/users/${user.id}/cart`,
                         {
                              method: "PUT",
                              headers: {
                                   "Content-Type":
                                        "application/json",
                              },
                              body: JSON.stringify({
                                   productId: id,
                                   quantity: 1,
                              }),
                         }
                    );
               } catch (err) {
                    console.warn(
                         "Failed to update cart on server:",
                         err.message
                    );
               }
          }

          return {
               ok: true,
          };
     };

     // ========================================
     // DECREASE QUANTITY
     // ========================================
     const removeFromCart = async (id) => {
          try {
               await releaseProduct(id, 1);
          } catch (err) {
               console.warn(
                    "Release failed:",
                    err
               );
          }

          setCart((prev) =>
               prev
                    .map((item) =>
                         item._id === id
                              ? {
                                     ...item,
                                     quantity:
                                          item.quantity -
                                          1,
                                }
                              : item
                    )
                    .filter(
                         (item) =>
                              item.quantity > 0
                    )
          );

          // Update on backend if logged in
          if (user && user.id) {
               try {
                    await fetch(
                         `${API}/users/${user.id}/cart/${id}`,
                         { method: "DELETE" }
                    );
               } catch (err) {
                    console.warn(
                         "Failed to update cart on server:",
                         err.message
                    );
               }
          }

          return {
               ok: true,
          };
     };

     // ========================================
     // REMOVE COMPLETE PRODUCT
     // ========================================
     const allClearFromCart = async (
          id
     ) => {
          const item = cart.find(
               (i) => i._id === id
          );

          if (item) {
               await releaseProduct(
                    id,
                    item.quantity || 0
               );
          }

          setCart((prev) =>
               prev.filter(
                    (item) => item._id !== id
               )
          );

          // Remove from backend if logged in
          if (user && user.id) {
               try {
                    await fetch(
                         `${API}/users/${user.id}/cart/${id}`,
                         { method: "DELETE" }
                    );
               } catch (err) {
                    console.warn(
                         "Failed to remove from cart on server:",
                         err.message
                    );
               }
          }

          return {
               ok: true,
          };
     };

     // ========================================
     // CLEAR CART
     // ========================================
     const clearCart = () => {
          setCart([]);
     };

     // ========================================
     // RELEASE ALL
     // ========================================
     const releaseAllFromCart =
          async () => {
               const items = [...cart];

               for (const item of items) {
                    if (!item?._id)
                         continue;

                    const qty =
                         item.quantity || 0;

                    if (qty > 0) {
                         await releaseProduct(
                              item._id,
                              qty
                         );
                    }
               }

               setCart([]);
          };

     // ========================================
     // SYNC LOCAL CART TO SERVER AND FETCH ON LOGIN
     // ========================================
     const syncLocalCartToServer = async () => {
          if (!user || !user.id || cart.length === 0) return;

          for (const item of cart) {
               if (!item?._id) continue;

               try {
                    await fetch(
                         `${API}/users/${user.id}/cart`,
                         {
                              method: "PUT",
                              headers: {
                                   "Content-Type":
                                        "application/json",
                              },
                              body: JSON.stringify({
                                   productId: item._id,
                                   quantity:
                                        item.quantity || 1,
                              }),
                         }
                    );
               } catch (err) {
                    console.warn(
                         "Failed to sync cart item to server:",
                         item._id,
                         err.message
                    );
               }
          }
     };

     useEffect(() => {
          if (user && user.id) {
               (async () => {
                    try {
                         await syncLocalCartToServer();

                         const res = await fetch(
                              `${API}/users/${user.id}/cart`
                         );
                         if (!res.ok) {
                              console.warn(
                                   "Failed to fetch cart:",
                                   res.status
                              );
                              return;
                         }
                         const data = await res.json();
                         const cartItems = (data.cart || []).map(
                              (item) => ({
                                   ...item.product,
                                   quantity: item.quantity,
                              })
                         );
                         setCart(cartItems);
                    } catch (err) {
                         console.warn(
                              "Cart fetch error:",
                              err.message
                         );
                    }
               })();
          }
     }, [user, API]);

     // ========================================
     // CLEAR ON LOGOUT
     // ========================================
     useEffect(() => {
          if (!user) {
               (async () => {
                    try {
                         await releaseAllFromCart();
                    } catch (err) {
                         console.warn(
                              "Release all failed:",
                              err
                         );
                    }

                    localStorage.removeItem(
                         "cart"
                    );
               })();
          }
     }, [user]);

     // ========================================
     // TOTAL PRICE
     // ========================================
     const total = cart.reduce(
          (acc, item) =>
               acc +
               item.price * item.quantity,
          0
     );

     // ========================================
     // PROVIDER
     // ========================================
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