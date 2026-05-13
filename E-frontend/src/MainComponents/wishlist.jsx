import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeartIcon from "../Components/icons/HeartIcon";
import { useWishlist } from "../context/WishlistContext";
import { Link } from "react-router-dom";
import AddToCartButton from "../MainComponents/addCartButton"; 
import { useStock } from "../context/StockContext";
import { FaHeartBroken, FaShoppingBag } from "react-icons/fa";

// Shared Styles for Consistency
const cardGlass = "bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-lg";
const hoverEffect = "hover:border-cyan-500/50 hover:shadow-cyan-500/20 hover:bg-slate-800/80 transition-all duration-300";

// Product Card for Wishlist
const WishlistCard = ({ product, onRemove }) => {
     const displayName = product.title || product.name;
     const { getStock } = useStock();
     const stock = getStock(product._id) ?? (product?.stock ?? product?.quantity ?? product?.qty ?? product?.available ?? 0);

     const getAdditionalDetails = () => {
          if (product.category === "book") {
               return (
                    <p className="text-sm text-gray-400 mt-1">
                         {product.author && <span className="text-cyan-200">By {product.author}</span>}
                         {product.pages && <span className="text-gray-500"> • {product.pages} pages</span>}
                    </p>
               );
          } else if (product.category === "t-shirt") {
               return (
                    <p className="text-sm text-gray-400 mt-1">
                         <span className="text-cyan-200">{product.brand && product.brand}</span>
                         {product.sizeOptions && <span className="text-gray-500"> • Sizes: {product.sizeOptions.join(", ")}</span>}
                    </p>
               );
          } else if (product.specifications) {
               return (
                    <p className="text-sm text-gray-400 mt-1">
                         {product.specifications?.ram && <span className="text-cyan-200">{product.specifications.ram} RAM</span>}{" "}
                         {product.specifications?.storage && <span className="text-gray-500">| {product.specifications.storage} Storage</span>}
                    </p>
               );
          }
          return null;
     };

     return (
          <motion.div
               layout
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
               className={`${cardGlass} ${hoverEffect} rounded-2xl p-4 grid md:grid-cols-12 gap-6 group relative overflow-hidden`}
          >
               {/* Glowing Accent Blob */}
               <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-all duration-500"></div>

               {/* Image Section */}
               <div className="md:col-span-4 relative overflow-hidden rounded-xl aspect-[4/3] md:aspect-auto">
                    <img
                         src={product.image}
                         alt={displayName}
                         className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               </div>

               {/* Details Section */}
               <div className="md:col-span-8 flex flex-col justify-between z-10">
                    <div>
                         <div className="flex justify-between items-start">
                              <div>
                                   <h3 className="text-xl font-bold text-gray-100 group-hover:text-cyan-300 transition-colors duration-300">
                                        {displayName}
                                   </h3>
                                   {getAdditionalDetails()}
                                   <p className="text-gray-400 mt-2 text-sm line-clamp-2 leading-relaxed">{product.description}</p>
                              </div>

                              {/* Remove Button */}
                              <button
                                   onClick={() => onRemove(product._id)}
                                   className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-all duration-300 border border-white/10 hover:border-red-500/50"
                                   title="Remove from wishlist"
                              >
                                   <HeartIcon className="w-5 h-5 fill-current" />
                              </button>
                         </div>

                         {/* Price & Discount */}
                         <div className="mt-4 flex flex-wrap items-center gap-3">
                              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500">
                                   ₹{product.price.toLocaleString("en-IN")}
                              </span>
                              {product.discount > 0 && (
                                   <span className="text-xs bg-pink-500/20 text-pink-300 font-bold px-2 py-1 rounded-md border border-pink-500/30">
                                        -{product.discount}% OFF
                                   </span>
                              )}
                         </div>
                    </div>

                    {/* Footer: Tags & Action */}
                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-4">
                         <div className="flex flex-wrap gap-2">
                              {/* Offer Tags */}
                              {product.offerTags?.map((tag, index) => (
                                   <span key={index} className="inline-block bg-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded border border-indigo-500/30">
                                        {tag}
                                   </span>
                              ))}

                              {/* Stock Status */}
                              {stock > 0 ? (
                                   <span className="inline-block bg-emerald-500/20 text-emerald-400 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded border border-emerald-500/30">
                                        {stock} in stock
                                   </span>
                              ) : (
                                   <span className="inline-block bg-red-500/20 text-red-400 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded border border-red-500/30">
                                        Sold Out
                                   </span>
                              )} 
                         </div>

                         <div className="w-full sm:w-auto">
                              <AddToCartButton product={product} />
                         </div>
                    </div>
               </div>
          </motion.div>
     );
};

// Main Wishlist Component
const Wishlist = () => {
     const { wishlistItems, removeFromWishlist } = useWishlist();
     const { fetchAndSetStocks, getStock } = useStock();

     const handleRemoveFromWishlist = (productId) => {
          removeFromWishlist(productId);
     };

     // Warm stock data for wishlist products
     React.useEffect(() => {
          const ids = wishlistItems.map(i => i._id).filter(Boolean);
          if (ids.length > 0) fetchAndSetStocks(ids);
     }, [wishlistItems, fetchAndSetStocks]);

     return (
          // Night Sky Background
          <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a2e] via-[#020617] to-[#05051a] text-gray-100 pt-24 pb-20">
               <div className="container mx-auto px-4 lg:px-8">

                    {/* Header */}
                    <motion.div
                         initial={{ opacity: 0, y: -20 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="text-center mb-12"
                    >
                         <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400 mb-2 pb-2">
                              My Wishlist
                         </h1>
                         <p className="text-gray-400 text-lg">Save your favorite items for later</p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                         {wishlistItems.length === 0 ? (
                              // Empty State
                              <motion.div
                                   key="empty"
                                   initial={{ opacity: 0, scale: 0.9 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   exit={{ opacity: 0, scale: 0.9 }}
                                   className={`${cardGlass} max-w-lg mx-auto text-center py-16 px-6 rounded-3xl flex flex-col items-center`}
                              >
                                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/10">
                                        <FaHeartBroken className="text-4xl text-gray-500" />
                                   </div>
                                   <h2 className="text-2xl font-bold text-gray-200 mb-3">
                                        Your wishlist is empty
                                   </h2>
                                   <p className="text-gray-400 mb-8 max-w-xs mx-auto leading-relaxed">
                                        Seems like you haven't found anything you like yet. Explore our store and find your next favorite item!
                                   </p>
                                   <Link to="/">
                                        <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1">
                                             <FaShoppingBag /> Start Shopping
                                        </button>
                                   </Link>
                              </motion.div>
                         ) : (
                              // Wishlist Grid
                              <motion.div
                                   key="grid"
                                   className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto"
                              >
                                   <AnimatePresence>
                                        {wishlistItems.map((item) => (
                                             <WishlistCard
                                                  key={item._id}
                                                  product={item}
                                                  onRemove={handleRemoveFromWishlist}
                                             />
                                        ))}
                                   </AnimatePresence>
                              </motion.div>
                         )}
                    </AnimatePresence>
               </div>
          </div>
     );
};

export default Wishlist;