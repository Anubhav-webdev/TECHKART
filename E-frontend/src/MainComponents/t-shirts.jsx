import React, { useState, useEffect } from "react";

import AddToCartButton from "../MainComponents/addCartButton";
import { useStock } from "../context/StockContext";

const TShirts = () => {
     const [products, setProducts] = useState([]);
     const [filteredProducts, setFilteredProducts] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     // State for mobile filter sidebar toggle
     const [showFilters, setShowFilters] = useState(false);

     // removed stock context; read stock directly from product objects

     const [filters, setFilters] = useState({
          price: [],
          brand: [],
          size: [],
          color: [],
          gender: [],
          rating: [],
          discount: [],
     });

     const { getStock, fetchAndSetStocks } = useStock();

     // Fetch t-shirts
     useEffect(() => {
          fetch("http://localhost:7000/api/tshirts/")
               .then((res) => res.json())
               .then((data) => {
                    const arr = Array.isArray(data) ? data : [];
                    setProducts(arr);
                    setFilteredProducts(arr);
                    setLoading(false);
                    try { fetchAndSetStocks(arr.map(p => p._id).filter(Boolean)); } catch (e) { /* ignore */ }
               })
               .catch((err) => {
                    console.error("Fetch error:", err);
                    setError("Failed to load t-shirts.");
                    setLoading(false);
               });
     }, []);

     const handleFilterChange = (filterType, value) => {
          setFilters((prev) => {
               const current = prev[filterType] || [];
               const updated = current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value];
               return { ...prev, [filterType]: updated };
          });
     };

     const clearAllFilters = () => {
          setFilters({
               price: [],
               brand: [],
               size: [],
               color: [],
               gender: [],
               rating: [],
               discount: [],
          });
     };

     // Apply filters
     useEffect(() => {
          let filtered = [...products];

          if (filters.price.length > 0) {
               filtered = filtered.filter((p) => {
                    const price = p.price || 0;
                    return filters.price.some((range) => {
                         if (range === "Under ₹500") return price < 500;
                         if (range === "₹500 - ₹1000") return price >= 500 && price <= 1000;
                         if (range === "Above ₹1000") return price > 1000;
                         return true;
                    });
               });
          }

          if (filters.brand.length > 0)
               filtered = filtered.filter((p) => filters.brand.includes(p.brand));

          if (filters.gender.length > 0)
               filtered = filtered.filter((p) => filters.gender.includes(p.gender));

          if (filters.size.length > 0)
               filtered = filtered.filter((p) =>
                    (p.sizeOptions || []).some((s) => filters.size.includes(s))
               );

          if (filters.color.length > 0)
               filtered = filtered.filter((p) =>
                    (p.colorOptions || []).some((c) => filters.color.includes(c))
               );

          if (filters.rating.length > 0) {
               filtered = filtered.filter((p) => {
                    const rating = p.rating || 0;
                    return filters.rating.some((r) => {
                         if (r === "4★ & above") return rating >= 4;
                         if (r === "3★ & above") return rating >= 3;
                         if (r === "2★ & above") return rating >= 2;
                         return true;
                    });
               });
          }

          if (filters.discount.length > 0) {
               filtered = filtered.filter((p) => {
                    const d = p.discount || 0;
                    return filters.discount.some((range) => {
                         if (range === "10%+") return d >= 10;
                         if (range === "20%+") return d >= 20;
                         return true;
                    });
               });
          }

          setFilteredProducts(filtered);
     }, [filters, products]);

 // LOADING STATE
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#020617] text-cyan-400">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-cyan-900/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 font-medium tracking-widest uppercase text-xs animate-pulse">Syncing with Cosmos...</p>
      </div>
    );
  }

  // OFFLINE / ERROR STATE
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#020617] p-6">
        <div className="max-w-md w-full text-center bg-cyan-950/20 border border-cyan-500/20 p-10 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 5 5 0 015-5M3 3l18 18" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {error === "OFFLINE" ? "Connection Lost" : "Transmission Error"}
          </h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            {error === "OFFLINE" 
              ? "We couldn't connect to our servers. Please check your internet connection." 
              : "Something went wrong while retrieving mobile data. Our engineers are notified."}
          </p>
          <button 
            onClick={fetchProducts}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

     const filterOptions = {
          price: ["Under ₹500", "₹500 - ₹1000", "Above ₹1000"],
          brand: Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).slice(0, 10),
          size: Array.from(new Set(products.flatMap((p) => p.sizeOptions || []))).slice(0, 10),
          color: Array.from(new Set(products.flatMap((p) => p.colorOptions || []))).slice(0, 10),
          gender: Array.from(new Set(products.map((p) => p.gender).filter(Boolean))),
          rating: ["4★ & above", "3★ & above", "2★ & above"],
          discount: ["10%+", "20%+"],
     };

     return (
          <div className="flex flex-col lg:flex-row bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a2e] via-[#020617] to-[#05051a] text-white min-h-screen mt-16 lg:mt-20 relative">

               {/* MOBILE FILTER BUTTON */}
               <div className="lg:hidden p-4 pb-0 flex items-center justify-between">
                    <button
                         onClick={() => setShowFilters(true)}
                         className="flex items-center gap-2 bg-cyan-900/50 text-cyan-200 border border-cyan-700 px-4 py-2 rounded font-semibold text-sm hover:bg-cyan-900 transition mt-4"
                    >
                         <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                         >
                              <path
                                   strokeLinecap="round"
                                   strokeLinejoin="round"
                                   strokeWidth={2}
                                   d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                              />
                         </svg>
                         Filters
                    </button>
               </div>

               {/* MOBILE BACKDROP OVERLAY */}
               {showFilters && (
                    <div
                         className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                         onClick={() => setShowFilters(false)}
                    ></div>
               )}

               {/* Filter Sidebar */}
               <aside
                    className={`
            fixed top-0 left-0 h-full w-72 bg-[#05051a] z-50 p-5 shadow-2xl border-r border-gray-800 overflow-y-auto transform transition-transform duration-300 ease-in-out
            ${showFilters ? "translate-x-0" : "-translate-x-full"}
            lg:static lg:translate-x-0 lg:block lg:shadow-none lg:bg-transparent lg:border-r lg:z-auto
        `}
               >
                    <div className="flex items-center justify-between mb-5">
                         <h2 className="text-xl font-semibold text-cyan-200 tracking-wide underline">
                              Filters
                         </h2>
                         {/* Close Button (Mobile Only) */}
                         <button
                              onClick={() => setShowFilters(false)}
                              className="lg:hidden text-gray-400 hover:text-white"
                         >
                              <svg
                                   xmlns="http://www.w3.org/2000/svg"
                                   className="h-6 w-6"
                                   fill="none"
                                   viewBox="0 0 24 24"
                                   stroke="currentColor"
                              >
                                   <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                   />
                              </svg>
                         </button>

                         <button
                              onClick={clearAllFilters}
                              className="hidden lg:block text-sm text-red-500 hover:underline"
                         >
                              Clear All
                         </button>
                    </div>

                    {/* Mobile Clear All Button */}
                    <button
                         className="lg:hidden w-full mb-4 text-sm text-red-500 border border-blue-900/50 p-2 rounded hover:bg-blue-900/20"
                         onClick={clearAllFilters}
                    >
                         Clear All
                    </button>

                    {Object.entries(filterOptions).map(([key, values]) => (
                         <div key={key} className="mb-6 pb-4 border-b border-gray-800">
                              <h3 className="text-sm font-bold uppercase text-gray-400 mb-3 tracking-wide">
                                   {key.charAt(0).toUpperCase() + key.slice(1)}
                              </h3>
                              {values.length === 0 ? (
                                   <p className="text-sm text-gray-500">No options</p>
                              ) : (
                                   values.map((value) => {
                                        const active = filters[key].includes(value);
                                        return (
                                             <label
                                                  key={value}
                                                  className={`flex items-center text-sm mb-2 cursor-pointer ${active
                                                       ? "text-cyan-400 font-semibold"
                                                       : "text-gray-400 hover:text-gray-200"
                                                       }`}
                                             >
                                                  <input
                                                       type="checkbox"
                                                       className="mr-3 accent-cyan-600 w-4 h-4 rounded border-gray-600 bg-gray-700"
                                                       checked={active}
                                                       onChange={() => handleFilterChange(key, value)}
                                                  />
                                                  {value}
                                             </label>
                                        );
                                   })
                              )}
                         </div>
                    ))}
               </aside>

               {/* Product Section */}
               <div className="w-full p-3 lg:p-3 flex-1">
                    {filteredProducts.length === 0 ? (
                         <p className="text-center text-gray-500 mt-8">No t-shirts found.</p>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                              {filteredProducts.map((product) => (
                                   <article
                                        key={product._id || product.name}
                                        className="group bg-cyan-900/10 border border-cyan-900/30 rounded-lg shadow-lg hover:shadow-cyan-900/20 transition-all duration-300 p-4"
                                   >
                                        {/* RESPONSIVE LAYOUT: Flex Column on Mobile, Row on Desktop */}
                                        <div className="flex flex-col items-center sm:flex-row gap-4 sm:gap-6t">

                                             {/* Image */}
                                             <div className="w-full sm:w-auto flex justify-center sm:block bg-white rounded p-1">
                                                  <img
                                                       src={product.image || product.gallery?.[0] || "/placeholder.jpg"}
                                                       alt={product.name}
                                                       className="w-full h-48 sm:w-40 sm:h-40 object-contain rounded-md shadow-inner"
                                                  />
                                             </div>

                                             {/* Details */}
                                             <div className="flex-1 min-w-0 w-full">
                                                  <h3 className="text-cyan-400 font-bold text-lg hover:underline cursor-pointer truncate">
                                                       {product.name}
                                                  </h3>
                                                  <div className="text-sm text-gray-400">
                                                       {product.brand}
                                                       {product.gender ? ` • ${product.gender}` : ""}
                                                  </div>

                                                  <div className="mt-2 flex items-center gap-3">
                                                       <span className="inline-flex items-center bg-cyan-700 text-white text-sm font-medium px-2 py-0.5 rounded">
                                                            &#9733; {product.rating ?? 0}
                                                       </span>
                                                       <span className="text-gray-400 text-sm">
                                                            {(product.reviews && product.reviews.length) || 0} Reviews
                                                       </span>
                                                  </div>

                                                  <p className="mt-3 text-gray-300 text-sm line-clamp-2">
                                                       {product.description}
                                                  </p>

                                                  <ul className="mt-3 space-y-2 text-xs">
                                                       {product.sizeOptions?.length > 0 && (
                                                            <li className="flex flex-wrap items-center gap-2 text-teal-300 font-medium bg-teal-900/30 px-2 py-1 rounded-md border border-teal-800/50">
                                                                 <span className="text-teal-400 font-semibold">
                                                                      🧷 Sizes:
                                                                 </span>
                                                                 <span className="text-gray-300">
                                                                      {product.sizeOptions.join(", ")}
                                                                 </span>
                                                            </li>
                                                       )}
                                                       {product.colorOptions?.length > 0 && (
                                                            <li className="flex flex-wrap items-center gap-2 text-pink-300 font-medium bg-pink-900/30 px-2 py-1 rounded-md border border-pink-800/50">
                                                                 <span className="text-pink-400 font-semibold">
                                                                      🎨 Colors:
                                                                 </span>
                                                                 <span className="text-gray-300">
                                                                      {product.colorOptions.join(", ")}
                                                                 </span>
                                                            </li>
                                                       )}
                                                       {product.sleeve && (
                                                            <li className="flex flex-wrap items-center gap-2 text-purple-300 font-medium bg-purple-900/30 px-2 py-1 rounded-md border border-purple-800/50">
                                                                 <span className="text-purple-400 font-semibold">
                                                                      👕 Sleeve:
                                                                 </span>
                                                                 <span className="text-gray-300">{product.sleeve}</span>
                                                            </li>
                                                       )}
                                                  </ul>
                                             </div>

                                             {/* Right Column (Price/Btn) */}
                                             {/* Mobile: Row (Price left, Btn right) | Desktop: Column (Price top, Btn bottom) */}
                                             <div className="w-full sm:w-44 border-t border-gray-800 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0 flex flex-row sm:flex-col justify-between items-center sm:items-end self-stretch">
                                                  <div className="text-left sm:text-right">
                                                       <div className="text-xl font-bold text-white">
                                                            ₹{(product.price || 0).toLocaleString()}
                                                       </div>
                                                       {product.oldPrice && (
                                                            <div className="text-sm text-gray-500 line-through">
                                                                 ₹{product.oldPrice.toLocaleString()}
                                                            </div>
                                                       )}
                                                       {product.discount > 0 && (
                                                            <div className="text-sm text-green-400 font-medium">
                                                                 {product.discount}% off
                                                            </div>
                                                       )}
                                                  </div>

                                                  <div className="flex flex-col items-end gap-2">
                                                       <span className="hidden sm:inline-block bg-teal-900/50 text-orange-400 border border-orange-500/30 font-semibold px-2 py-1 rounded text-xs mb-1">
                                                            {product.offerTags?.[0] || "Hot Deal"}
                                                       </span>

                                                       <div className="text-pink-500 text-xs font-medium">
                                                            {(() => {
                                                                 const ctx = getStock(product._id);
                                                                 const available = ctx ?? product?.stock ?? product?.quantity ?? product?.qty ?? product?.available ?? 0;
                                                                 return available > 0 ? `${available} in stock` : "Sold Out";
                                                            })()}
                                                       </div>

                                                       <div className="hover:scale-105 transition-transform duration-200">
                                                            <AddToCartButton product={product} />
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </article>
                              ))}
                         </div>
                    )}
               </div>
          </div>
     );
};

export default TShirts;