import React from 'react';
import { motion } from 'framer-motion';
import logo1 from '../assets/images/boat.png';
import logo2 from '../assets/images/samsung.png';
import logo3 from '../assets/images/intel.png';
import logo4 from '../assets/images/adidas.png';
import logo5 from '../assets/images/dell.png';

const Brands = () => {
     const logos = [logo1, logo2, logo3, logo4, logo5];

     const containerVariants = {
          hidden: { opacity: 0 },
          visible: {
               opacity: 1,
               transition: {
                    staggerChildren: 0.2,
               },
          },
     };

     const itemVariants = {
          hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
          visible: {
               opacity: 1,
               y: 0,
               filter: "blur(0px)",
               transition: { duration: 0.6 }
          },
     };

     return (
          <section className="py-16 bg-[#020617] border-t border-b border-white/5 relative overflow-hidden">

               {/* Ambient Background Glow */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-full bg-cyan-900/5 blur-[100px] pointer-events-none"></div>

               <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         viewport={{ once: true }}
                         className="text-center mb-8"
                    >
                         <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                              Trusted by Industry Leaders
                         </p>
                    </motion.div>

                    <motion.div
                         variants={containerVariants}
                         initial="hidden"
                         whileInView="visible"
                         viewport={{ once: true }}
                         className="flex flex-wrap justify-center lg:justify-between items-center gap-10 md:gap-16"
                    >
                         {logos.map((logo, index) => (
                              <motion.div
                                   key={index}
                                   variants={itemVariants}
                                   whileHover={{
                                        scale: 1.1,
                                        filter: "grayscale(0%) brightness(1.2) drop-shadow(0 0 10px rgba(34,211,238,0.5))",
                                        opacity: 1
                                   }}
                                   className="cursor-pointer transition-all duration-300"
                              >
                                   {/* Style Logic:
                                1. grayscale(100%): Makes logos black/white to fit dark theme initially.
                                2. brightness(200%) or invert(1): Adjust this based on your actual logo files. 
                                   If logos are black text, use 'invert(1)'. If they are white/color, use 'brightness'.
                                   Below assumes standard colored logos.
                            */}
                                   <img
                                        src={logo}
                                        alt={`Brand logo ${index + 1}`}
                                        className="h-8 md:h-12 w-auto object-contain opacity-40 grayscale transition-all duration-300 hover:opacity-100"
                                        style={{ filter: 'grayscale(100%) brightness(150%) contrast(120%)' }} // Adjust styling to make logos look "silver" in dark mode
                                   />
                              </motion.div>
                         ))}
                    </motion.div>
               </div>
          </section>
     );
};

export default Brands;