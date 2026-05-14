import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import HeartIcon from "./icons/HeartIcon"; // Ensure this path is correct
import { NavLink } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useStock } from "../context/StockContext";
import { API_BASE_URL } from "../config/apiConfig"; 

// --- Shared Styles ---
const glassCard = "bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-lg";
const neonText = "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500";
const popupStyle = "fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-900/90 border border-cyan-500/50 text-cyan-300 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)] z-50 opacity-0 transition-opacity duration-300 backdrop-blur-md font-semibold tracking-wide";

// Popup
const popup = (message) => {
     const popupDiv = document.createElement("div");
     popupDiv.className = popupStyle;
     popupDiv.innerText = message;
     document.body.appendChild(popupDiv);
     setTimeout(() => {
          popupDiv.style.opacity = "1";
          setTimeout(() => {
               popupDiv.style.opacity = "0";
               setTimeout(() => {
                    document.body.removeChild(popupDiv);
               }, 300);
          }, 2000);
     }, 10);
};

// Product Card
const ProductCard = ({ product }) => {
     const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
     const { addToCart } = useCart();
     const { getStock } = useStock();

     const displayName = product.title || product.name;
     const stock = getStock(product._id) ?? product?.stock ?? product?.quantity ?? product?.qty ?? product?.available ?? 0;

     const handleAddToCart = async () => {
          if (stock <= 0) {
               popup(`${displayName} is Sold Out!`);
               return;
          }
          try {
               const result = await addToCart(product);
               if (result && result.ok) popup(`${displayName} added to cart!`);
               else popup(result && result.error ? result.error : `${displayName} could not be added`);
          } catch (err) {
               popup(`${displayName} could not be added`);
               console.error(err);
          }
     }; 

     const getAdditionalDetails = () => {
          if (product.category === "book") {
               return (
                    <span className="text-xs text-gray-400 mt-2 block">
                         {product.author && <span className="text-cyan-200">By {product.author}</span>}
                         {product.pages && <span className="text-gray-500"> • {product.pages} pgs</span>}
                    </span>
               );
          } else if (product.category === "t-shirt") {
               return (
                    <span className="text-xs text-gray-400 mt-2 block">
                         <span className="text-cyan-200">{product.brand}</span>
                         {product.sizeOptions && <span className="text-gray-500"> • {product.sizeOptions.join(", ")}</span>}
                    </span>
               );
          } else if (product.specifications) {
               return (
                    <span className="text-xs text-gray-400 mt-2 block">
                         {product.specifications?.ram && <span className="text-cyan-200">{product.specifications.ram}</span>}{" "}
                         {product.specifications?.storage && <span className="text-gray-500">| {product.specifications.storage}</span>}
                    </span>
               );
          }
          return null;
     };

     return (
          <motion.div
               initial={{ opacity: 0, y: 40, scale: 0.95 }}
               whileInView={{ opacity: 1, y: 0, scale: 1 }}
               whileHover={{ y: -10 }}
               viewport={{ once: true }}
               className={`group relative ${glassCard} rounded-3xl overflow-hidden cursor-pointer 
            transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] h-full flex flex-col`}
          >
               {/* Image Container */}
               <div className="relative overflow-hidden h-72 flex-shrink-0">
                    <img
                         src={product.image}
                         alt={displayName}
                         className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />

                    {/* Dark Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Wishlist Button */}
                    <button
                         onClick={(e) => {
                              e.preventDefault();
                              isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product);
                         }}
                         className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md border transition-all duration-300 
                    ${isInWishlist(product._id)
                                   ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                   : "bg-black/30 border-white/10 text-gray-300 hover:bg-cyan-500 hover:text-white hover:border-cyan-400"
                              }`}
                    >
                         <HeartIcon className={`w-5 h-5 ${isInWishlist(product._id) ? "fill-cyan-300" : ""}`} />
                    </button>

                    {/* Add to Cart Slider */}
                    <div
                         onClick={handleAddToCart}
                         className={`absolute rounded-t-3xl  bottom-0 left-0 w-full py-3 text-center font-bold tracking-wider text-sm uppercase
                    translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out backdrop-blur-md
                    ${stock <= 0
                                   ? "bg-red-900/80 text-red-200 cursor-not-allowed"
                                   : "bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white hover:from-cyan-500 hover:to-blue-500"
                              }`}
                    >
                         {stock <= 0 ? "Sold Out" : "Add to Cart"}
                    </div>
               </div>

               {/* Content Container */}
               <div className="p-5 flex flex-col flex-grow">
                    {/* Category/Brand Tag */}
                    <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                              {product.category}
                         </span>
                         {product.discount > 0 && (
                              <span className="text-[10px] font-bold bg-pink-600/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/30">
                                   -{product.discount}%
                              </span>
                         )}
                    </div>

                    <h5 className="text-lg font-bold text-gray-100 mb-1 group-hover:text-cyan-300 transition-colors line-clamp-1">
                         {displayName}
                    </h5>

                    <p className="text-gray-400 text-sm line-clamp-2 mb-3 flex-grow">
                         {product.description}
                    </p>

                    {/* Divider */}
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

                    {/* Price & Stock */}
                    <div className="flex justify-between items-end mt-auto">
                         <div>
                              <p className={`text-xl font-extrabold ${neonText}`}>
                                   ₹{product.price.toLocaleString("en-IN")}
                              </p>
                              <p className={`text-xl font-extrabold ${neonText}`}>{getAdditionalDetails()}</p>
                         </div>

                         <div className="text-right">
                              <span className={`text-[10px] font-semibold px-2 py-1 rounded border
                            ${stock > 0
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                   }`}>
                                   {stock > 0 ? `${stock} Left` : "Sold Out"}
                              </span>
                         </div>
                    </div>
               </div>
          </motion.div>
     );
};

// Main Carousel Component
export default function ProductCarousel({ title, category, featured }) {
     const [products, setProducts] = useState([]);
     const { fetchAndSetStocks } = useStock();
     // removed stock context; read stock directly from product objects

     useEffect(() => {
          // Use relative path so Vite proxy / current origin handles backend during dev and avoids mixed-content issues
          fetch(`${API_BASE_URL}/products`)
               .then(async (res) => {
                    if (!res.ok) {
                         const text = await res.text().catch(() => null);
                         throw new Error(`HTTP ${res.status} - ${text || res.statusText}`);
                    }
                    return res.json();
               })
               .then((data) => {
                    let filtered = data;
                    if (category) filtered = filtered.filter((p) => p.category === category);
                    if (featured) filtered = filtered.filter((p) => p.featured === true);
                    filtered = filtered.slice(0, 10); // Show up to 10 products
                    setProducts(filtered);                    // Warm up stock map for displayed products
                    try { fetchAndSetStocks(filtered.map(p => p._id).filter(Boolean)); } catch (e) { /* ignore */ }               })
               .catch((err) => console.error("Fetch error (products):", err));
     }, [category, featured]);

     return (
          // Night Sky Background with Custom Swiper Colors
          <section
               className="py-24 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a2e] via-[#020617] to-[#05051a]"
               style={{
                    "--swiper-navigation-color": "#22d3ee", // Cyan-400
                    "--swiper-pagination-color": "#22d3ee",
               }}
          >
               <div className="container mx-auto px-6 relative z-10">

                    {/* Header Section */}
                    <div className="flex flex-wrap justify-between items-end mb-12 gap-4">
                         <motion.div
                              initial={{ opacity: 0, x: -30 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5 }}
                         >
                              <h4 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                                        {title}
                                   </span>
                              </h4>
                              <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                         </motion.div>

                         {category && (
                              <motion.div
                                   initial={{ opacity: 0, x: 30 }}
                                   whileInView={{ opacity: 1, x: 0 }}
                                   transition={{ duration: 0.5 }}
                              >
                                   <NavLink
                                        to={`/shop/${category}s`}
                                        className="group flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
                                   >
                                        <span className="relative">
                                             View Collection
                                             <span className="absolute left-0 bottom-0 w-0 h-px bg-cyan-300 transition-all duration-300 group-hover:w-full"></span>
                                        </span>
                                        <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                                   </NavLink>
                              </motion.div>
                         )}
                    </div>

                    {/* Swiper Slider */}
                    <div className="relative">
                         {/* Background Glow Effect behind Swiper */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-900/10 blur-3xl rounded-full pointer-events-none"></div>

                         <Swiper
                              modules={[Navigation, Pagination]}
                              navigation
                              pagination={{ clickable: true, dynamicBullets: true }}
                              spaceBetween={24}
                              slidesPerView={1}
                              className="pb-14 !px-4" // Add padding bottom for pagination
                              breakpoints={{
                                   640: { slidesPerView: 2 },
                                   850: { slidesPerView: 3 },
                                   1200: { slidesPerView: 4 },
                              }}
                         >
                              {products.map((product) => (
                                   <SwiperSlide key={product._id} className="h-auto">
                                        <ProductCard product={product} />
                                   </SwiperSlide>
                              ))}
                         </Swiper>
                    </div>
               </div>
          </section>
     );
}