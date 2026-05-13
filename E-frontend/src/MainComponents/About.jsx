import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// Custom Animated Counter to replace external dependency
const AnimatedCounter = ({ to, duration = 3, suffix = "" }) => {
     const count = useMotionValue(0);
     const rounded = useTransform(count, (latest) => {
          return Math.round(latest).toLocaleString() + suffix;
     });

     useEffect(() => {
          const controls = animate(count, to, { duration: duration, ease: "easeOut" });
          return controls.stop;
     }, [to, duration]);

     return <motion.span>{rounded}</motion.span>;
};

const About = () => {
     const [userCount, setUserCount] = useState(0);
     const [productCount, setProductCount] = useState(0);

     useEffect(() => {
          const fetchCounts = async () => {
               try {
                    // Fallback values for visual demonstration if API fails
                    const fallbackUsers = 1250;
                    const fallbackProducts = 150;

                    try {
                         // 👉 Fetch Users
                         const resUsers = await fetch("https://techkart-ava8.onrender.com/api/auth/count");
                         if (resUsers.ok) {
                              const dataUsers = await resUsers.json();
                              setUserCount(dataUsers.totalUsers);
                         } else {
                              setUserCount(fallbackUsers);
                         }

                         // 👉 Fetch Products
                         const resProducts = await fetch("https://techkart-ava8.onrender.com/api/products/count");
                         if (resProducts.ok) {
                              const dataProducts = await resProducts.json();
                              setProductCount(dataProducts.total);
                         } else {
                              setProductCount(fallbackProducts);
                         }
                    } catch (e) {
                         // If fetch fails entirely (e.g. server down), use fallbacks
                         setUserCount(fallbackUsers);
                         setProductCount(fallbackProducts);
                    }

               } catch (err) {
                    console.log("Error fetching counts:", err);
               }
          };

          fetchCounts();
     }, []);

     const StatCard = ({ count, label, suffix = "+" }) => (
          <motion.div
               whileHover={{ y: -5 }}
               className="text-center p-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300"
          >
               <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 mb-2">
                    <AnimatedCounter to={count} suffix={suffix} />
               </h3>
               <p className="text-gray-400 font-medium tracking-wide uppercase text-sm">{label}</p>
          </motion.div>
     );

     return (
          <section className="py-24 relative bg-[#020617] overflow-hidden">

               {/* Ambient Background Glow */}
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

               <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.6 }}
                         viewport={{ once: true }}
                         className="max-w-4xl mx-auto text-center mb-16"
                    >
                         <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                                   About TechKart
                              </span>
                         </h2>
                         <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto mb-8"></div>

                         <p className="text-gray-300 text-lg leading-relaxed mb-6">
                              TechKart is your premier destination for cutting-edge technology and innovative products. We bridge the gap between the future and today, offering a curated selection of gadgets that enhance your digital lifestyle.
                         </p>
                         <p className="text-gray-400 leading-relaxed">
                              Our mission is to make high-quality technology accessible to everyone. Whether you are a gamer, a creator, or a professional, we provide the tools you need to excel in a digital world.
                         </p>
                    </motion.div>

                    <motion.div
                         initial={{ opacity: 0, y: 30 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.6, delay: 0.2 }}
                         viewport={{ once: true }}
                         className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                    >
                         {/* 🔥 Animated User Count */}
                         <StatCard count={userCount} label="Happy Customers" />

                         {/* 🔥 Animated Product Count */}
                         <StatCard count={productCount} label="Premium Products" />

                         {/* 🔥 Static Satisfaction Count */}
                         <StatCard count={99} label="Customer Satisfaction" suffix="%" />
                    </motion.div>
               </div>
          </section>
     );
};

export default About;