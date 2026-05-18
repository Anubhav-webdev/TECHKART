import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
     FaFacebookF, FaTwitter, FaYoutube, FaPinterest, 
     FaInstagram, FaChevronDown, FaArrowUp 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/apiConfig';
import logo from '../assets/images/logo.png';

const SocialIcon = ({ Icon, color }) => (
     <motion.a
          href="#"
          whileHover={{ y: -5, color: color }}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
     >
          <Icon />
     </motion.a>
);

const FooterLink = ({ href, text }) => (
     <li>
          <Link
               to={href}
               className="group relative text-gray-400 hover:text-cyan-300 transition-colors duration-300 inline-block"
          >
               {text}
               <span className="absolute left-0 bottom-0 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </Link>
     </li>
);

const FooterSection = ({ title, children, underlineColor }) => {
     const [isOpen, setIsOpen] = useState(false);
     const [isMobile, setIsMobile] = useState(false);

     useEffect(() => {
          const checkMobile = () => {
               const mobile = window.innerWidth < 768;
               setIsMobile(mobile);
               // If desktop, always keep open. If mobile, keep current state (default closed)
               if (!mobile) setIsOpen(true);
               else setIsOpen(false); 
          };
          
          checkMobile();
          window.addEventListener('resize', checkMobile);
          return () => window.removeEventListener('resize', checkMobile);
     }, []);

     return (
          <div className="border-b border-white/5 md:border-none py-2 md:py-0">
               <button 
                    disabled={!isMobile}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex justify-between items-center md:cursor-default md:block group py-2 md:py-0"
               >
                    <h5 className="font-bold uppercase tracking-widest text-gray-100 mb-0 md:mb-6 relative inline-block text-left text-sm md:text-base">
                         {title}
                         <span className={`hidden md:block absolute left-0 -bottom-2 w-8 h-1 ${underlineColor} rounded-full`}></span>
                    </h5>
                    
                    {isMobile && (
                         <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-cyan-500/50 gap-2 flex items-center"
                         >
                              <FaChevronDown size={14} />
                         </motion.div>
                    )}
               </button>

               <AnimatePresence initial={false}>
                    {isOpen && (
                         <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                         >
                              <div className="pb-4 md:pb-0 pt-2 md:pt-0">
                                   {children}
                              </div>
                         </motion.div>
                    )}
               </AnimatePresence>
          </div>
     );
};

const Footer = () => {
     const { user } = useAuth();
     const [showScrollTop, setShowScrollTop] = useState(false);
     const [feedbackText, setFeedbackText] = useState("");
     const [feedbackStatus, setFeedbackStatus] = useState({ text: "", type: "" });
     const [isSending, setIsSending] = useState(false);

     useEffect(() => {
          const handleScroll = () => {
               setShowScrollTop(window.scrollY > 400);
          };
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
     }, []);

     const submitFeedback = async () => {
          if (!user || !user.id) {
               setFeedbackStatus({ text: "Please login to submit feedback.", type: "error" });
               return;
          }

          if (!feedbackText.trim()) {
               setFeedbackStatus({ text: "Please describe your problem before submitting.", type: "error" });
               return;
          }

          setIsSending(true);
          setFeedbackStatus({ text: "", type: "" });

          try {
               const res = await fetch(`${API_BASE_URL}/feedback`, {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                         userId: user.id,
                         problem: feedbackText.trim(),
                    }),
               });

               const data = await res.json();

               if (!res.ok) {
                    setFeedbackStatus({ text: data.message || "Feedback submission failed.", type: "error" });
               } else {
                    setFeedbackText("");
                    setFeedbackStatus({ text: "Feedback sent successfully. Admin will review it soon.", type: "success" });
               }
          } catch (err) {
               console.error("Feedback submit error:", err);
               setFeedbackStatus({ text: "Unable to send feedback. Please try again later.", type: "error" });
          } finally {
               setIsSending(false);
          }
     };

     const scrollToTop = () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
     };

     return (
          <footer className="relative bg-[#020617] text-gray-300 pt-10 pb-5 overflow-hidden border-t border-white/5">
               {/* Ambient Backgrounds */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
               <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

               <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 justify-items-center">

                         {/* Brand Section */}
                         <div className="mb-4 md:mb-0">
                              <div className="flex items-center gap-3 mb-6">
                                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-500/30 backdrop-blur-md">
                                        <img src={logo} alt="TechKart Logo" className="w-8 h-8 object-contain" />
                                   </div>
                                   <h4 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-400 tracking-tight">
                                        TechKart
                                   </h4>
                              </div>
                              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
                                   TechKart is your one-stop shop for all things tech. Premium quality and speed delivered to your doorstep.
                              </p>
                              <div className="flex space-x-3">
                                   <SocialIcon Icon={FaFacebookF} color="#3b5998" />
                                   <SocialIcon Icon={FaTwitter} color="#1DA1F2" />
                                   <SocialIcon Icon={FaYoutube} color="#FF0000" />
                                   <SocialIcon Icon={FaPinterest} color="#BD081C" />
                                   <SocialIcon Icon={FaInstagram} color="#C13584" />
                              </div>
                         </div>

                         <FooterSection title="Quick Links" underlineColor="bg-cyan-500">
                              <ul className="space-y-3 text-sm">
                                   <FooterLink href="/" text="Home" />
                                   <FooterLink href="/wishlist" text="Wishlist" />
                                   <FooterLink href="/cart" text="Cart" />
                              </ul>
                         </FooterSection>

                         <FooterSection title="Help & Info" underlineColor=" bg-blue-500 ">
                              
                              <ul className="space-y-3 text-sm flex flex-col">
                                   <FooterLink href="/info" text="About Us" />
                                   <FooterLink href="/blog" text="Our Blog" />
                                   <FooterLink href="/news" text="News" />
                              </ul>
                         </FooterSection>

                         <FooterSection title="Contact Us" underlineColor="bg-purple-500">
                              <div className="space-y-4 text-sm text-gray-400">
                                   <p>Questions? <a href="mailto:NeoPhoenix@TechKart.com" className="block text-cyan-400 font-medium hover:underline">NeoPhoenix@TechKart.com</a></p>
                                   <p>Call us: <a href="tel:+12345678" className="block text-cyan-400 font-medium hover:underline">+1 (234) 567-890</a></p>
                                   <p>Location: <span className="block mt-1 text-xs">123 Tech Avenue, Silicon Valley, CA</span></p>
                                   <div className="mt-4">
                                        <label htmlFor="footerFeedback" className="text-xs uppercase tracking-widest text-gray-400">Send Feedback</label>
                                        <textarea
                                             id="footerFeedback"
                                             value={feedbackText}
                                             onChange={(e) => setFeedbackText(e.target.value)}
                                             rows={3}
                                             placeholder="Describe your problem here (max 250 chars)..."
                                             className="w-full mt-2 rounded-xl border border-white/10 bg-slate-900/90 text-gray-100 p-3 text-sm placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                                             maxLength={250}
                                        />
                                        <button
                                             type="button"
                                             onClick={submitFeedback}
                                             disabled={isSending}
                                             className="mt-3 w-full rounded-xl bg-cyan-500 text-black font-bold px-4 py-2 hover:bg-cyan-400 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                             {isSending ? "Sending..." : "Submit Feedback"}
                                        </button>
                                        {feedbackStatus.text && (
                                             <p className={`mt-2 text-sm ${feedbackStatus.type === "success" ? "text-emerald-400" : "text-pink-400"}`}>
                                                  {feedbackStatus.text}
                                             </p>
                                        )}
                                   </div>
                              </div>
                         </FooterSection>
                    </div>

                    <div className="border-t border-white/5 pt-8 mt-10 flex flex-col md:flex-row justify-between items-center gap-4">
                         <p className="text-gray-500 text-sm text-center md:text-left">
                              © Copyright 2025 <span className="text-cyan-500 font-semibold">NeoPhoenix</span> || All rights reserved.&reg;
                         </p>
                         <div className="flex gap-6 text-xs text-gray-600">
                              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
                              <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
                         </div>
                    </div>
               </div>

               {/* Back to Top Button */}
               <AnimatePresence>
                    {showScrollTop && (
                         <motion.button
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              onClick={scrollToTop}
                              className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-slate-500/50 text-white rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 transition-colors"
                         >
                              <FaArrowUp />
                         </motion.button>
                    )}
               </AnimatePresence>
          </footer>
     );
};

export default Footer;