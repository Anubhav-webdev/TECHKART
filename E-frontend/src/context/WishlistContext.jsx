import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';


const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
     const { user } = useAuth();
     const [wishlistItems, setWishlistItems] = useState(() => {
          const saved = localStorage.getItem('wishlist');
          return saved ? JSON.parse(saved) : [];
     });

     // ========================================
     // SAFE API URL
     // ========================================
     const RAW_API =
          import.meta.env.VITE_API_URL?.trim() ||
          "https://techkart-ava8.onrender.com/api";

     const API = RAW_API.endsWith("/api")
          ? RAW_API
          : `${RAW_API}/api`;

     // Keep localStorage in sync
     useEffect(() => {
          localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
     }, [wishlistItems]);

     // Helpful debug: surface wishlist-driven stock syncs
     const debugWishlistSync = (ids) => console.debug('Wishlist: syncing stock for items', ids);
     useEffect(() => {
          const fetchWishlist = async () => {
               if (!user || !user.id) return;
               try {
                    const res = await fetch(`${API}/users/${user.id}/wishlist`);
                    if (!res.ok) return;
                    const data = await res.json();
                    // data.wishlist will be array of product docs
                    const list = data.wishlist || [];
                    setWishlistItems(list);
                    // Sync stock for wishlist products so UI reflects latest availability
                    if (list.length > 0) {
                         debugWishlistSync(list.map(p => p._id || p.id));
                    }
               } catch (err) {
                    console.error("Failed to fetch wishlist:", err.message);
               }
          };
          fetchWishlist();
     }, [user, API]);

     // When user logs out, clear wishlist from UI and localStorage so it doesn't persist after logout
     useEffect(() => {
          if (!user) {
               setWishlistItems([]);
               try {
                    localStorage.removeItem('wishlist');
               } catch (err) {
                    // ignore
               }
          }
     }, [user]);

     const addToWishlist = async (product) => {
          // Optimistic update
          setWishlistItems(current => {
               if (current.find(item => item._id === product._id)) return current;
               return [...current, product];
          });



          // If logged in, persist to backend
          if (user && user.id) {
               try {
                    await fetch(`${API}/users/${user.id}/wishlist`, {
                         method: 'PUT',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ productId: product._id })
                    });
               } catch (err) {
                    console.error('Failed to save wishlist on server:', err.message);
               }
          }
     };

     const removeFromWishlist = async (productId) => {
          setWishlistItems(current => current.filter(item => item._id !== productId));



          if (user && user.id) {
               try {
                    await fetch(`${API}/users/${user.id}/wishlist/${productId}`, {
                         method: 'DELETE'
                    });
               } catch (err) {
                    console.error('Failed to remove wishlist item on server:', err.message);
               }
          }
     };

     const isInWishlist = (productId) => {
          return wishlistItems.some(item => item._id === productId);
     };

     return (
          <WishlistContext.Provider value={{
               wishlistItems,
               addToWishlist,
               removeFromWishlist,
               isInWishlist
          }}>
               {children}
          </WishlistContext.Provider>
     );
};