import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTruck, FaPhone, FaQuestionCircle, FaChevronDown } from "react-icons/fa";

const Services = () => {
     const services = [
          {
               title: "Free Shipping",
               description: "Free shipping on orders over ₹999",
               icon: <FaTruck className="w-6 h-6" />,
               details: [
                    "Tracked delivery via reliable carriers.",
                    "Estimated delivery in 5-7 business days.",
                    "Express shipping options available.",
                    "Valid across all product categories."
               ]
          },
          {
               title: "24/7 Support",
               description: "Round the clock customer service",
               icon: <FaPhone className="w-6 h-6" />,
               details: [
                    "Toll-free phone support.",
                    "Live chat with a human agent.",
                    "Dedicated email response team.",
                    "Access to a comprehensive FAQ."
               ]
          },
          {
               title: "Easy Returns",
               description: "30-day return policy",
               icon: <FaQuestionCircle className="w-6 h-6" />,
               details: [
                    "Hassle-free return initiation.",
                    "Full refund to original payment method.",
                    "Pre-paid return shipping labels.",
                    "Exchanges are also supported."
               ]
          }
     ];

     const [openIndex, setOpenIndex] = useState(-1);

     const flipVariants = {
          front: { rotateY: 0 },
          back: { rotateY: 180 },
     };

     const toggleOpen = (index) => {
          setOpenIndex(openIndex === index ? -1 : index);
     };

  return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="bg-slate-950 p-10 min-h-screen text-white">
               <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight flex justify-center text-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500">
                         Our Services
                    </span>
               </h2>
               <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mx-auto mb-12"></div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((s, i) => {
                         const isOpen = openIndex === i;

                         return (
                              <div
                                   key={i}
                                   className="relative h-72 cursor-pointer"
                                   style={{ perspective: "1000px" }}
                                   onClick={() => toggleOpen(i)}
                              >
                                   <motion.div
                                        className="w-full h-full relative"
                                        animate={isOpen ? "back" : "front"}
                                        variants={flipVariants}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                        style={{ transformStyle: "preserve-3d" }}
                                   >
                                        {/* FRONT FACE - Deep Slate */}
                                        <div
                                             className="absolute inset-0 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center flex flex-col justify-center items-center"
                                             style={{ backfaceVisibility: "hidden" }}
                                        >
                                             <div className="inline-block p-4 bg-blue-500/10 rounded-xl text-cyan-400 mb-4">
                                                  {s.icon}
                                             </div>
                                             <h3 className="text-2xl font-bold mb-2 text-slate-100">{s.title}</h3>
                                             <p className="text-slate-400 mb-4">{s.description}</p>
                                             <FaChevronDown className={`text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                        </div>

                                        {/* BACK FACE - Vibrant Gradient */}
                                        <div
                                             className="absolute inset-0 p-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl shadow-2xl flex flex-col justify-center items-center"
                                             style={{
                                                  transform: "rotateY(180deg)",
                                                  backfaceVisibility: "hidden"
                                             }}
                                        >
                                             <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2">{s.title} Details</h3>
                                             <ul className="text-sm space-y-2 opacity-90">
                                                  {s.details.map((detail, dIdx) => (
                                                       <li key={dIdx} className="flex items-center gap-2">
                                                            <span className="h-1.5 w-1.5 bg-cyan-300 rounded-full" />
                                                            {detail}
                                                       </li>
                                                  ))}
                                             </ul>
                                             <FaChevronDown className="mt-6 opacity-50 rotate-180" />
                                        </div>
                                   </motion.div>
                              </div>
                         );
                    })}
               </div>
          </motion.div>
     );
};

export default Services;