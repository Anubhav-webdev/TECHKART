import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig";

// --- Shared Styles ---
const glassCard = "bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-lg";

// ---------------------------- Format Date ----------------------------
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

// ---------------------------- Blog Post Card ----------------------------
const BlogPost = ({ image, category, date, title, excerpt, author, readTime }) => {
     const [expanded, setExpanded] = useState(false);
     const formattedDate = formatDateForDisplay(date);

     return (
          <motion.article
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5 }}
               className={`group ${glassCard} rounded-3xl overflow-hidden hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-500 relative flex flex-col h-full`}
          >
               {/* Image Container */}
               <div className="relative overflow-hidden h-60 flex-shrink-0">
                    <motion.img
                         whileHover={{ scale: 1.1 }}
                         transition={{ duration: 0.7, ease: "easeOut" }}
                         src={
                              image ||
                              `https://placehold.co/600x400/0f172a/FFFFFF?text=${category || "Tech"}`
                         }
                         alt={title}
                         onError={(e) => {
                              e.target.src = `https://placehold.co/600x400/0f172a/FFFFFF?text=${category || "Tech"}`;
                         }}
                         className="w-full h-full object-cover"
                    />

                    {/* Dark Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>

                    {/* Floating Date Badge */}
                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-cyan-300 text-xs font-bold px-3 py-1 rounded-full border border-white/10 shadow-lg">
                         {formattedDate}
                    </div>
               </div>

               <div className="p-6 relative flex flex-col flex-grow">
                    {/* Category Tag */}
                    <div className="mb-3">
                         <span className="inline-block bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                              {category || "Uncategorized"}
                         </span>
                    </div>

                    <h3 className="text-xl font-bold mb-3 text-gray-100 group-hover:text-cyan-300 transition-colors duration-300 leading-tight">
                         {title}
                    </h3>

                    {/* Expandable Content */}
                    <motion.div
                         animate={{ height: expanded ? "auto" : 72 }}
                         transition={{ duration: 0.4 }}
                         className={`text-gray-400 text-sm mb-4 overflow-hidden relative flex-grow ${!expanded && "after:absolute after:bottom-0 after:left-0 after:w-full after:h-12 after:bg-gradient-to-t after:from-slate-900/60 after:to-transparent"}`}
                    >
                         <p className={expanded ? "" : "line-clamp-3 leading-relaxed"}>{excerpt}</p>
                    </motion.div>

                    {/* Divider */}
                    <div className="w-full h-px bg-white/5 my-4"></div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between mt-auto">
                         <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg text-xs">
                                   {author ? author.charAt(0) : "A"}
                              </div>
                              <span className="text-xs font-medium text-gray-300">{author || "Admin"}</span>
                         </div>

                         <button
                              onClick={() => setExpanded(!expanded)}
                              className="text-cyan-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                         >
                              {expanded ? "Close" : "Read"}
                              <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="inline-block">↓</motion.span>
                         </button>
                    </div>
               </div>
          </motion.article>
     );
};

// ---------------------------- MAIN BLOG SECTION ----------------------------
const Blog = () => {
     const [posts, setPosts] = useState([]);
     const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
          // Fetch posts
          fetch(`${API_BASE_URL}/blogs`)
               .then((res) => res.json())
               .then((data) => setPosts(data))
               .catch((err) => console.error("Blog fetch error:", err))
               .finally(() => setIsLoading(false));
     }, []);

     return (
          <section className="py-24 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a2e] via-[#020617] to-[#05051a] overflow-hidden">

               {/* Background Decor */}
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

               <div className="container mx-auto px-6 relative z-10">
                    {/* Header Section */}
                    <div className="flex flex-wrap justify-between items-end mb-12 gap-4">
                         <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5 }}
                         >
                              <h4 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-2">
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                                        Latest Insights
                                   </span>
                              </h4>
                              <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                         </motion.div>

                         <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5 }}
                         >
                              <NavLink
                                   to="/blog"
                                   className="group flex items-center gap-2 text-cyan-400 font-semibold hover:text-white transition-colors duration-300"
                              >
                                   <span>View All Posts</span>
                                   <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                              </NavLink>
                         </motion.div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                         <div className="text-center py-20">
                              <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                         </div>
                    )}

                    {/* Blog Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                         {!isLoading && posts.slice(0, 3).map((post) => (
                              <BlogPost key={post._id} {...post} />
                         ))}
                    </div>

                    {/* Empty State */}
                    {!isLoading && posts.length === 0 && (
                         <div className={`text-center py-16 ${glassCard} rounded-3xl max-w-lg mx-auto`}>
                              <div className="text-4xl mb-4">📡</div>
                              <h3 className="text-xl text-gray-200 font-bold">
                                   No transmissions received
                              </h3>
                              <p className="text-gray-500 mt-2">Check back later for new updates.</p>
                         </div>
                    )}
               </div>
          </section>
     );
};

export default Blog;