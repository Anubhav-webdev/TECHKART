import React from 'react';
import { FaShippingFast, FaPhone, FaTruck } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- SERVICE ITEM COMPONENT ---
const ServiceItem = ({ icon: Icon, title, description, index }) => (
     <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          whileHover={{ y: -10 }}
          className="group p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col items-center text-center h-full"
     >
          {/* Icon Container with Glow */}
          <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-600/10 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/40 shadow-inner transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
               <Icon className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          </div>

          <h3 className="text-xl font-bold uppercase tracking-wider text-gray-100 mb-3 group-hover:text-cyan-300 transition-colors">
               {title}
          </h3>

          <p className="text-gray-400 leading-relaxed">
               {description}
          </p>
     </motion.div>
);

// --- SERVICES COMPONENT ---
const Services = () => {
     const services = [
          {
               icon: FaShippingFast,
               title: 'Free Shipping',
               description: 'Enjoy free priority shipping on all orders over ₹999.'
          },
          {
               icon: FaPhone,
               title: '24/7 Support',
               description: 'Our tech experts are available round the clock to assist you.'
          },
          {
               icon: FaTruck,
               title: 'Easy Returns',
               description: 'Hassle-free 30-day return policy. No questions asked.'
          }
     ];

     return (
          <section className="py-20 bg-[#020617] border-t border-white/5 relative overflow-hidden">

               {/* Background Decor */}
               <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

               <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {services.map((service, index) => (
                              <ServiceItem
                                   key={service.title}
                                   index={index}
                                   icon={service.icon}
                                   title={service.title}
                                   description={service.description}
                              />
                         ))}
                    </div>
               </div>
          </section>
     );
};

export default Services;