import React, { useState, useEffect } from "react";
import AddToCartButton from "../MainComponents/addCartButton";
import { useStock } from "../context/StockContext";

const Mobile = () => {
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
          ram: [],
          rom: [],
          rating: [],
          discount: [],
     });

     const [searchQuery, setSearchQuery] = useState("");
     const [sortBy, setSortBy] = useState("");

     const category = "mobile";
     const { getStock, fetchAndSetStocks } = useStock();

     // Fetch Products
     useEffect(() => {
          fetch("http://localhost:7000/api/products")
               .then((res) => res.json())
               .then((data) => {
                    let filtered = Array.isArray(data) ? data : [];

                    filtered = filtered.filter(
                         (p) => (p.category || "").toString() === category
                    );

                    setProducts(filtered);
                    setFilteredProducts(filtered);
                    setLoading(false);
                    try { fetchAndSetStocks(filtered.map(p => p._id).filter(Boolean)); } catch (e) { /* ignore */ }
               })
               .catch((err) => {
                    console.error("Fetch Error:", err);
                    setError("Failed to load products.");
                    setLoading(false);
               });
     }, []);

     // Handle Filters
     const handleFilterChange = (filterType, value) => {
          setFilters((prev) => {
               const exists = prev[filterType].includes(value);
               return {
                    ...prev,
                    [filterType]: exists
                         ? prev[filterType].filter((v) => v !== value)
                         : [...prev[filterType], value],
               };
          });
     };

     const clearAllFilters = () => {
          setFilters({
               price: [],
               brand: [],
               ram: [],
               rom: [],
               rating: [],
               discount: [],
          });
          setSearchQuery("");
          setSortBy("");
     };

     // Dynamic Filter Data
     const dynamicFilterOptions = {
          brand: [...new Set(products.map((p) => p.brand).filter(Boolean))],
          ram: [...new Set(products.map((p) => p.specifications?.ram).filter((v) => v && v !== ""))],
          rom: [...new Set(products.map((p) => p.specifications?.storage).filter((v) => v && v !== ""))],
     };

     const filterOptions = {
          price: ["₹10,000 - ₹20,000", "₹20,000 - ₹30,000", "₹30,000 - ₹40,000", "₹40,000 - ₹50,000", "₹50,000+"],
          rating: ["4★ & above", "3★ & above", "2★ & above"],
          discount: ["10% off", "20% off", "30% off", "40% off", "50% off"],
          ...dynamicFilterOptions,
     };

     // Apply Filters logic
     useEffect(() => {
          let filtered = [...products];

          if (searchQuery.trim() !== "") {
               filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
          }

          if (filters.price.length > 0) {
               filtered = filtered.filter((p) => {
                    const price = p.price || 0;
                    return filters.price.some((range) => {
                         if (range === "₹10,000 - ₹20,000") return price >= 10000 && price <= 20000;
                         if (range === "₹20,000 - ₹30,000") return price >= 20000 && price <= 30000;
                         if (range === "₹30,000 - ₹40,000") return price >= 30000 && price <= 40000;
                         if (range === "₹40,000 - ₹50,000") return price >= 40000 && price <= 50000;
                         if (range === "₹50,000+") return price >= 50000;
                         return false;
                    });
               });
          }

          if (filters.brand.length > 0) filtered = filtered.filter((p) => filters.brand.includes(p.brand));
          if (filters.ram.length > 0) filtered = filtered.filter((p) => filters.ram.includes(p.specifications?.ram));
          if (filters.rom.length > 0) filtered = filtered.filter((p) => filters.rom.includes(p.specifications?.storage));

          if (filters.rating.length > 0) {
               filtered = filtered.filter((p) => {
                    const rating = p.rating || 0;
                    return filters.rating.some((r) => {
                         if (r === "4★ & above") return rating >= 4;
                         if (r === "3★ & above") return rating >= 3;
                         if (r === "2★ & above") return rating >= 2;
                         return false;
                    });
               });
          }

          if (filters.discount.length > 0) {
               filtered = filtered.filter((p) => {
                    const d = Number((p.discount || "0").toString().replace("%", ""));
                    return filters.discount.some((range) => {
                         if (range === "10% off") return d >= 10;
                         if (range === "20% off") return d >= 20;
                         if (range === "30% off") return d >= 30;
                         if (range === "40% off") return d >= 40;
                         if (range === "50% off") return d >= 50;
                         return false;
                    });
               });
          }

          if (sortBy === "priceLowHigh") filtered.sort((a, b) => a.price - b.price);
          if (sortBy === "priceHighLow") filtered.sort((a, b) => b.price - a.price);
          if (sortBy === "ratingHighLow") filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

          setFilteredProducts(filtered);
     }, [filters, searchQuery, sortBy, products]);

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

     return (
          <div className="flex flex-col lg:flex-row bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a2e] via-[#020617] to-[#05051a] text-white min-h-screen mt-16 lg:mt-20 relative ">

               {/* MOBILE FILTER BUTTON */}
               <div className="lg:hidden p-4 pb-0 flex items-center justify-between">
                    <button
                         onClick={() => setShowFilters(true)}
                         className="flex items-center gap-2 bg-cyan-900/50 text-cyan-200 border border-cyan-700 px-4 py-2 rounded font-semibold text-sm hover:bg-cyan-900 transition  mt-4"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                         </svg>
                         Filters
                    </button>
               </div>

               {/* MOBILE BACKDROP OVERLAY (Closes menu when clicked) */}
               {showFilters && (
                    <div
                         className="fixed inset-0 bg-black/60 z-40 lg:hidden "
                         onClick={() => setShowFilters(false)}
                    ></div>
               )}

               {/* FILTER SIDEBAR */}
               <aside
                    className={`
                    fixed top-0 left-0 h-full w-72 bg-[#05051a] z-50 p-5 shadow-2xl border-r border-gray-800 overflow-y-auto transform transition-transform duration-300 ease-in-out
                    ${showFilters ? "translate-x-0" : "-translate-x-full"}
                    lg:static lg:translate-x-0 lg:block lg:shadow-none lg:bg-transparent lg:border-r lg:z-auto
                `}
               >
                    <div className="flex items-center justify-between mb-5">
                         <h2 className="text-xl font-semibold underline text-cyan-200">Filters</h2>

                         {/* Close Button (Mobile Only) */}
                         <button
                              onClick={() => setShowFilters(false)}
                              className="lg:hidden text-gray-400 hover:text-white"
                         >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                         </button>

                         <button className="hidden lg:block text-base text-red-500 hover:underline " onClick={clearAllFilters}>
                              Clear All
                         </button>
                    </div>

                    {/* Mobile Clear All Button */}
                    <button className="lg:hidden w-full mb-4 text-sm text-red-500 border border-blue-900/50 p-2 rounded hover:bg-blue-900/20" onClick={clearAllFilters}>
                         Clear All
                    </button>

                    {Object.entries(filterOptions).map(([key, values]) => (
                         <div key={key} className="mb-6 border-b border-gray-800 pb-3">
                              <h3 className="text-sm font-bold uppercase text-gray-400 mb-2">{key}</h3>
                              {values.map((value) => {
                                   const active = filters[key]?.includes(value);
                                   return (
                                        <label key={value} className={`flex items-center text-sm mb-2 cursor-pointer ${active ? "text-cyan-400 font-semibold" : "text-gray-400 hover:text-gray-200"}`}>
                                             <input
                                                  type="checkbox"
                                                  className="mr-3 accent-cyan-600 w-4 h-4 rounded border-gray-600 bg-gray-700"
                                                  checked={active}
                                                  onChange={() => handleFilterChange(key, value)}
                                             />
                                             {value}
                                        </label>
                                   );
                              })}
                         </div>
                    ))}
               </aside>

               {/* PRODUCT SECTION */}
               <div className="w-full p-4 lg:p-6 flex-1">
                    {/* Search + Sort */}
                    <div className="flex flex-col md:flex-row justify-between mb-5 gap-4">
                         <input
                              type="text"
                              placeholder="Search mobiles..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="px-4 py-2 border border-gray-700 rounded-md w-full md:w-72 bg-[#0f0f2e] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                         />

                         <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                              className="px-3 py-2 border border-gray-700 rounded-md w-full md:w-auto bg-[#0f0f2e] text-white focus:outline-none focus:border-cyan-500"
                         >
                              <option value="">Sort By</option>
                              <option value="priceLowHigh">Price: Low to High</option>
                              <option value="priceHighLow">Price: High to Low</option>
                              <option value="ratingHighLow">Rating: High to Low</option>
                         </select>
                    </div>

                    {filteredProducts.length === 0 ? (
                         <p className="text-center text-gray-500 mt-8">No products found.</p>
                    ) : (
                         filteredProducts.map((product) => (
                              <article key={product._id} className="bg-cyan-900/10 border border-cyan-900/30 p-4 mb-4 rounded-lg shadow-lg hover:shadow-cyan-900/20 transition-all group">
                                   <div className="flex flex-col sm:flex-row gap-6">
                                        {/* IMAGE */}
                                        <div className="flex justify-center sm:justify-start bg-white rounded p-2 sm:w-40 sm:h-40">
                                             <img
                                                  src={product.image || "/placeholder.jpg"}
                                                  alt={product.name}
                                                  className="w-full h-48 sm:h-full object-contain"
                                             />
                                        </div>

                                        {/* DETAILS */}
                                        <div className="flex-1">
                                             <h3 className="text-xl font-bold text-cyan-400">{product.name}</h3>
                                             <p className="mt-1 text-gray-400 text-sm">⭐ {product.rating ?? 0} • {product.reviews?.length || 0} reviews</p>

                                             <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-sm  text-gray-300">
                                                  {product.specifications?.display && (
                                                       <p className="truncate"><span className="text-teal-500">Display:</span> {product.specifications.display}</p>
                                                  )}
                                                  {product.specifications?.processor && (
                                                       <p className="truncate"><span className="text-teal-500">Processor:</span> {product.specifications.processor}</p>
                                                  )}
                                                  {product.specifications?.ram && (
                                                       <p className="truncate"><span className="text-cyan-500">RAM:</span> {product.specifications.ram}</p>
                                                  )}
                                                  {product.specifications?.storage && (
                                                       <p className="truncate"><span className="text-cyan-500">Storage:</span> {product.specifications.storage}</p>
                                                  )}
                                                  {product.specifications?.battery && (
                                                       <p className="truncate"><span className="text-pink-500">Battery:</span> {product.specifications.battery}</p>
                                                  )}
                                                  {product.specifications?.camera && (
                                                       <p className="truncate"><span className="text-pink-500">Camera:</span> {product.specifications.camera}</p>
                                                  )}
                                                  {product.specifications?.os && (
                                                       <p className="truncate"><span className="text-green-600">OS:</span> {product.specifications.os}</p>
                                                  )}
                                                  {product.specifications?.features && (
                                                       <p className="truncate">
                                                            <span className="text-green-600">FEATURES:</span>{" "}
                                                            {product.specifications.features}
                                                       </p>
                                                  )}
                                             </div>
                                        </div>

                                        {/* PRICE & BUTTONS */}
                                        <div className="w-full sm:w-48 flex flex-row sm:flex-col justify-between items-center sm:items-end border-t border-gray-800 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                                             <div className="text-left sm:text-right">
                                                  <div className="text-2xl font-bold text-white">₹{product.price.toLocaleString()}</div>
                                                  {product.oldPrice && <div className="text-sm text-gray-500 line-through">₹{product.oldPrice.toLocaleString()}</div>}
                                                  {product.discount && <div className="text-sm text-green-400 font-medium">{product.discount}% off</div>}
                                             </div>

                                             <div className="flex flex-col items-end gap-3 mt-2">
                                                  <div className="text-pink-500 text-xs font-medium" aria-live="polite">
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
                         ))
                    )}
               </div>
          </div>
     );
};

export default Mobile;