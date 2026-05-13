import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMinus } from "react-icons/fa";

const FAQ = ({ question, answer, isOpen, onClick }) => (
     <div className={`border rounded-2xl overflow-hidden transition-all duration-300 mb-4 
    ${isOpen
               ? "bg-slate-800/60 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
               : "bg-slate-900/40 border-white/10 hover:border-cyan-500/30 hover:bg-slate-800/40"
          }`}
     >
          <button
               className="w-full py-5 px-6 flex justify-between items-center text-left group"
               onClick={onClick}
          >
               <span className={`font-bold text-lg transition-colors duration-300 ${isOpen ? "text-cyan-300" : "text-gray-200 group-hover:text-white"}`}>
                    {question}
               </span>
               <span className={`ml-4 p-3 rounded-full flex-shrink-0 transition-all duration-300 border border-transparent 
        ${isOpen
                         ? "bg-cyan-500/20 text-cyan-300 rotate-180 border-cyan-500/30"
                         : "bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white"
                    }`}
               >
                    {isOpen ? <FaMinus size={10} /> : <FaPlus size={10} />}
               </span>
          </button>

          <AnimatePresence initial={false}>
               {isOpen && (
                    <motion.div
                         initial="collapsed"
                         animate="open"
                         exit="collapsed"
                         variants={{
                              open: { opacity: 1, height: "auto" },
                              collapsed: { opacity: 0, height: 0 }
                         }}
                         transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                         <div className="px-6 pb-6 pt-2">
                              <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mb-4"></div>
                              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                                   {answer}
                              </p>
                         </div>
                    </motion.div>
               )}
          </AnimatePresence>
     </div>
);

const Faqs = () => {
     const [active, setActive] = useState(null);

     const faqs = [
          {
               question: "What payment methods do you accept?",
               answer: "We accept UPI, Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery on selected products. All transactions are secured with 256-bit encryption."
          },
          {
               question: "How long does shipping take?",
               answer: "Standard delivery takes 3–5 working days. Express delivery options (1-2 days) are available during checkout for select metro cities."
          },
          {
               question: "What is your return policy?",
               answer: "We offer a 30-day easy return policy on most products. Items must be unused, in original packaging, and include all tags/accessories."
          },
          {
               question: "Do you offer warranty on products?",
               answer: "Yes! All electronic items come with a comprehensive manufacturer's warranty ranging from 1 to 3 years. Warranty cards are included in the box."
          },
          {
               question: "Can I track my order in real-time?",
               answer: "Absolutely! Once shipped, you’ll receive a live tracking link via email and SMS. You can also track orders directly from your 'My Orders' dashboard."
          },
          {
               question: "Is Cash on Delivery available?",
               answer: "Yes, COD is available for over 15,000 pin codes across the country. Please check availability on the product page by entering your pin code."
          },
          {
               question: "How do I contact customer support?",
               answer: "Our tech experts are available 24/7. You can reach us via live chat on the website, email at support@techkart.com, or call our toll-free number."
          },
          {
               question: "What should I do if I receive a damaged product?",
               answer: "We have a strict quality check, but in rare cases of damage, please record an unboxing video and report it within 24 hours for an instant free replacement."
          }
     ];

     return (
          <section className=" relative bg-[#020617] overflow-hidden">

               {/* Background Decor */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

               <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         className="max-w-3xl mx-auto"
                    >
                         <div className="text-center">
                              <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                                        Frequently Asked Questions
                                   </span>
                              </h2>
                              <p className="text-gray-400">Got questions? We've got the answers.</p>
                         </div>

                         <div className="space-y-2">
                              {faqs.map((f, i) => (
                                   <FAQ
                                        key={i}
                                        {...f}
                                        isOpen={active === i}
                                        onClick={() => setActive(active === i ? null : i)}
                                   />
                              ))}
                         </div>
                    </motion.div>
               </div>
          </section>
     );
};

export default Faqs;