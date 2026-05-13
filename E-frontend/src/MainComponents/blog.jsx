import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Shared Styles ---
const glassCard = "bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl";
const glassInput = "bg-slate-800/50 backdrop-blur-md border border-white/10 text-gray-200 placeholder-gray-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20";
const neonText = "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500";

// Format date
const formatDateForDisplay = (dateString) => {
     if (!dateString) return "No Date";
     try {
          const date = new Date(dateString);
          if (isNaN(date)) return dateString;
          return date.toLocaleDateString("en-US", {
               year: "numeric",
               month: "short",
               day: "numeric",
          });
     } catch {
          return dateString;
     }
};

// ---------------------------- Category Filter ----------------------------
const CategoryFilter = ({ categories, activeCategory, onSelect }) => {
     const filterVariants = {
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
     };

     return (
          <motion.div
               initial="hidden"
               animate="visible"
               transition={{ staggerChildren: 0.05 }}
               className="flex flex-wrap gap-3 mb-10 justify-center"
          >
               {/* ALL POSTS BUTTON */}
               <motion.button
                    variants={filterVariants}
                    onClick={() => onSelect("all")}
                    className={`px-6 py-2 text-sm rounded-full font-semibold transition-all duration-300 transform hover:scale-[1.05] border
                    ${activeCategory === "all"
                              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                              : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-cyan-300 hover:border-cyan-500/30"
                         }`}
               >
                    All Posts
               </motion.button>

               {/* DYNAMIC CATEGORY BUTTONS */}
               {categories.map((category) => (
                    <button
                         key={category}
                         onClick={() => onSelect(category)}
                         className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-[1.05] border
                        ${activeCategory === category
                                   ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                                   : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-cyan-300 hover:border-cyan-500/30"
                              }`}
                    >
                         {category}
                    </button>
               ))}
          </motion.div>
     );
};

// ---------------------------- Blog Post Card ----------------------------
const BlogPost = ({ image, category, date, title, excerpt, author, readTime }) => {
     const [expanded, setExpanded] = useState(false);
     const formattedDate = formatDateForDisplay(date);

     return (
          <motion.article
               className={`group ${glassCard} rounded-2xl overflow-hidden hover:border-cyan-500/40 hover:shadow-cyan-500/10 transition-all duration-500 relative`}
          >
               {/* Image Container */}
               <div className="relative overflow-hidden h-56">
                    <motion.img
                         whileHover={{ scale: 1.08 }}
                         transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
                         src={
                              image ||
                              `https://placehold.co/600x400/1e293b/FFFFFF?text=${category || "Blog"}`
                         }
                         alt={title}
                         onError={(e) => {
                              e.target.src = `https://placehold.co/600x400/1e293b/FFFFFF?text=${category || "Blog"}`;
                         }}
                         className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80"></div>

                    {/* Floating Date Badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-cyan-300 text-xs px-3 py-1 rounded-full border border-white/10 shadow-lg">
                         {formattedDate}
                    </div>
               </div>

               <div className="p-6 relative">
                    {/* Category Tag */}
                    <div className="mb-4">
                         <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs px-3 py-1 rounded-md font-medium uppercase tracking-wider">
                              {category}
                         </span>
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-gray-100 group-hover:text-cyan-300 transition-colors duration-300 leading-tight">
                         {title}
                    </h3>

                    {/* Expandable Content */}
                    <motion.div
                         animate={{ height: expanded ? "auto" : 72 }}
                         transition={{ duration: 0.4 }}
                         className={`text-gray-400 text-sm mb-4 overflow-hidden relative ${!expanded && "after:absolute after:bottom-0 after:left-0 after:w-full after:h-8 after:bg-gradient-to-t after:from-slate-900/90 after:to-transparent"}`}
                    >
                         <p className={expanded ? "" : "line-clamp-3"}>{excerpt}</p>
                    </motion.div>

                    <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg text-sm">
                                   {author.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-gray-300">{author}</span>
                         </div>

                         <span className="text-xs text-gray-500 flex items-center gap-1">
                              ⏱ {readTime} min read
                         </span>
                    </div>

                    <div className="mt-5 text-right">
                         <button
                              onClick={() => setExpanded(!expanded)}
                              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-colors"
                         >
                              {expanded ? "Read Less" : "Read More"}
                              <motion.svg
                                   animate={{ rotate: expanded ? 90 : 0 }}
                                   transition={{ duration: 0.3 }}
                                   className="w-4 h-4 ml-2"
                                   fill="none"
                                   viewBox="0 0 24 24"
                                   stroke="currentColor"
                              >
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </motion.svg>
                         </button>
                    </div>
               </div>
          </motion.article>
     );
};

// ---------------------------- MAIN BLOG ----------------------------
const Blog = () => {
     const [posts, setPosts] = useState([]);
     const [activeCategory, setActiveCategory] = useState("all");
     const [searchQuery, setSearchQuery] = useState("");
     const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
          // --- Replace with your real API ---
          fetch("https://techkart-ava8.onrender.com/api/blogs")
               .then((res) => res.json())
               .then((data) => setPosts(data))
               .catch((err) => console.error("Blog fetch error:", err))
               .finally(() => setIsLoading(false));
     }, []);

     const categories = [
          ...new Set(
               posts
                    .map((post) => post.category)
                    .filter((c) => c && c.trim() !== "")
          ),
     ];

     const filteredPosts = posts.filter((post) => {
          const matchCategory = activeCategory === "all" || post.category === activeCategory;
          const matchSearch =
               post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
          return matchCategory && matchSearch;
     });

     return (
          // Night Sky Background
          <section className="py-20 px-4 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a2e] via-[#020617] to-[#05051a]">

               {/* Background Glow Effect */}
               <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px]"></div>
               </div>

               <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                         initial={{ opacity: 0, y: -20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.5 }}
                         className="text-center mb-16"
                    >
                         <h1 className="text-5xl md:text-6xl pt-9 font-extrabold mb-4 tracking-tight">
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                                   Developer's Blog
                              </span>
                         </h1>
                         <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                              Insights into the code, trends, and innovations shaping the digital universe.
                         </p>

                         {/* Search Bar */}
                         <div className="max-w-xl mx-auto relative group">
                              <input
                                   type="text"
                                   placeholder="Search articles..."
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}
                                   className={`w-full pl-12 pr-4 py-4 rounded-full outline-none transition-all duration-300 ${glassInput}`}
                              />
                              <svg
                                   className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors"
                                   fill="none"
                                   viewBox="0 0 24 24"
                                   stroke="currentColor"
                              >
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                         </div>
                    </motion.div>

                    <CategoryFilter
                         categories={categories}
                         activeCategory={activeCategory}
                         onSelect={setActiveCategory}
                    />

                    {isLoading ? (
                         <div className="text-center py-20">
                              <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                              <p className="mt-4 text-cyan-300 font-medium">Loading Transmission...</p>
                         </div>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                              <AnimatePresence mode="popLayout">
                                   {filteredPosts.map((post) => (
                                        <motion.div
                                             key={post._id}
                                             layout
                                             initial={{ opacity: 0, scale: 0.9 }}
                                             animate={{ opacity: 1, scale: 1 }}
                                             exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                             transition={{ duration: 0.4 }}
                                        >
                                             <BlogPost {...post} />
                                        </motion.div>
                                   ))}
                              </AnimatePresence>
                         </div>
                    )}

                    {filteredPosts.length === 0 && !isLoading && (
                         <div className={`text-center py-16 ${glassCard} rounded-2xl max-w-lg mx-auto`}>
                              <div className="text-6xl mb-4">🛸</div>
                              <h3 className="text-2xl text-gray-200 font-bold mb-2">
                                   Signal Lost
                              </h3>
                              <p className="text-gray-400">
                                   No articles found matching your criteria. Try a different frequency.
                              </p>
                         </div>
                    )}
               </div>
          </section>
     );
};

export default Blog;