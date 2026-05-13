import React, { useState } from "react";

// Import your new separate pages
import About from "./About";
import Services from "./Services";

import Contact from "./Contact";
import Faqs from "./Faqs";
import OrderTracking from "./OrderTracking";

const Info = () => {
     const [activeTab, setActiveTab] = useState("about");

     const renderContent = () => {
          switch (activeTab) {
               case "about":
                    return <About />;
               case "services":
                    return <Services />;
               case "contact":
                    return <Contact />;
               case "faqs":
                    return <Faqs />;
               case "tracking":
                    return <OrderTracking />;
               default:
                    return null;
          }
     };

     return (
          <div className="min-h-screen bg-[#020617] pt-20">
               <div className="container mx-auto px-4 py-8">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight flex justify-center">
                         <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                              TechKart Info
                         </span>
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto mb-8"></div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto space-x-4 mb-8 pb-4">
                         {[
                              { id: "about", label: "About Us" },
                              { id: "services", label: "Services" },
                              { id: "contact", label: "Contact" },
                              { id: "faqs", label: "FAQs" },
                              { id: "tracking", label: "Order Tracking" }
                         ].map((tab) => (
                              <button
                                   key={tab.id}
                                   onClick={() => setActiveTab(tab.id)}
                                   className={`px-6 py-2 text-sm rounded-full font-semibold transition-all duration-300 transform hover:scale-[1.05] border
                   ${activeTab === tab.id
                                             ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                                             : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-cyan-300 hover:border-cyan-500/30"
                                        }`}
                              >
                                   {tab.label}
                              </button>
                         ))}
                    </div>

                    {/* Page Content */}
                    <div className="bg-[#03071b] rounded-2xl p-8 shadow-lg">
                         {renderContent()}
                    </div>
               </div>
          </div>
     );
};

export default Info;
