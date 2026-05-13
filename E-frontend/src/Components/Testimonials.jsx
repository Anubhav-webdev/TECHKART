import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { FaQuoteLeft } from 'react-icons/fa';

import 'swiper/css';
import 'swiper/css/pagination';

const Testimonials = () => {
     const reviews = [
          {
               quote: "More than expected crazy soft, flexible and best fitted white simple denim shirt.",
               author: "Casual Way",
               role: "Verified Buyer"
          },
          {
               quote: "Best fitted white denim shirt more than expected crazy soft, flexible.",
               author: "Uptop",
               role: "Fashion Blogger"
          },
          {
               quote: "Best fitted white denim shirt more white denim than expected flexible crazy soft.",
               author: "Denim Craze",
               role: "Regular Customer"
          },
          {
               quote: "Another amazing review about the quality and fit of the products. Truly exceptional.",
               author: "Happy Customer",
               role: "Tech Lead"
          },
     ];

     return (
          <section className="py-24 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a0a2e] via-[#020617] to-[#05051a] overflow-hidden">

               {/* Ambient Background Glow */}
               <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

               <div className="container mx-auto px-6 relative z-10">
                    {/* Header */}
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         className="text-center mb-16"
                    >
                         <h3 className="text-3xl md:text-4xl font-extrabold uppercase tracking-widest mb-4">
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                                   Community Love
                              </span>
                         </h3>
                         <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto"></div>
                    </motion.div>

                    {/* Swiper Slider */}
                    <Swiper
                         modules={[Pagination, Autoplay]}
                         spaceBetween={30}
                         slidesPerView={1}
                         pagination={{ clickable: true, dynamicBullets: true }}
                         autoplay={{ delay: 4000, disableOnInteraction: false }}
                         loop={true}
                         className="pb-12"
                         style={{
                              "--swiper-pagination-color": "#22d3ee", // Cyan-400
                              "--swiper-pagination-bullet-inactive-color": "#475569",
                         }}
                         breakpoints={{
                              768: { slidesPerView: 2 },
                              1024: { slidesPerView: 3 },
                         }}
                    >
                         {reviews.map((review, index) => (
                              <SwiperSlide key={index} className="h-auto">
                                   <motion.div
                                        whileHover={{ y: -5 }}
                                        className="h-full bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl relative hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300 flex flex-col"
                                   >
                                        {/* Decorative Quote Icon */}
                                        <FaQuoteLeft className="text-4xl text-cyan-500/10 absolute top-6 right-6" />

                                        <div className="flex-grow mb-6 relative z-10">
                                             <p className="text-gray-300 text-lg leading-relaxed italic">
                                                  "{review.quote}"
                                             </p>
                                        </div>

                                        {/* Author Info */}
                                        <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-6">
                                             {/* Generated Avatar */}
                                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg text-lg flex-shrink-0">
                                                  {review.author.charAt(0).toUpperCase()}
                                             </div>

                                             <div>
                                                  <h4 className="text-cyan-400 font-bold uppercase tracking-wide text-sm">
                                                       {review.author}
                                                  </h4>
                                                  <p className="text-gray-500 text-xs">
                                                       {review.role}
                                                  </p>
                                             </div>
                                        </div>
                                   </motion.div>
                              </SwiperSlide>
                         ))}
                    </Swiper>
               </div>
          </section>
     );
};

export default Testimonials;