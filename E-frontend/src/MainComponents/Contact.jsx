import { motion } from "framer-motion";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import contactImg from "../assets/images/contact-illustration.png";

const Contact = () => (
     <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
     >
          <div>
               <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                         Contact Us
                    </span>
               </h2>
               <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full  mb-8"></div>


               <div className="space-y-4 text-teal-600">
                    <p className="flex items-center"><FaPhone className="mr-3" /> +91 1234567890</p>
                    <p className="flex items-center"><FaEnvelope className="mr-3" /> support@techkart.com</p>
                    <p className="flex items-center"><FaMapMarkerAlt className="mr-3" /> 123 Tech Street, Digital City</p>
               </div>

               <form className="mt-8 space-y-4">
                    <input type="text" placeholder="Name" className="w-full p-2 bg-teal-400/40 rounded-md text-cyan-400" />
                    <input type="email" placeholder="Email" className="w-full p-2 bg-teal-400/40 rounded-md text-cyan-400" />
                    <textarea rows={4} placeholder="Message" className="w-full p-2 bg-teal-400/40 rounded-md text-cyan-400" />
                    <button className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-2 px-4 rounded-md">
                         Send Message
                    </button>
               </form>
          </div>

          <div className="hidden md:block">
               <img
                    src={contactImg}
                    alt="Contact illustration"
                    className="w-full h-full object-contain"
               />
          </div>
     </motion.div>
);

export default Contact;
