import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import collectionVideo from "../assets/images/single-image-2.mp4";
import republicdayVideo from "../assets/images/single-image-3.mp4";
// import IndependencedayVideo from "../assets/images/single-image-4.mp4";
// import DiwaliVideo from "../assets/images/single-image-5.mp4";
// import NavratreVideo from "../assets/images/single-image-6.mp4";
import ChristmasVideo from "../assets/images/Single-image-7.mp4";


// Data for Tuesdays
const tuesdayCollections = [
     {
          title: "New Tuesday Drop",
          text: "Fresh arrivals just landed. Explore the newest pieces curated for your style.",
          video: collectionVideo,
          color: "from-teal-600 to-blue-600",
          glow: "cyan",
          discountCode: "TUESDAY20"
     },
     {
          title: "Minimalist Edition",
          text: "Clean, calm, and classy. Perfect essentials for your wardrobe.",
          video: collectionVideo,
          color: "from-purple-600 to-pink-600",
          glow: "purple",
          discountCode: "MINIMAL15"
     },
     {
          title: "Urban Gear",
          text: "Streetwear vibes with sharp attitude. Be bold this Tuesday.",
          video: collectionVideo,
          color: "from-orange-600 to-red-600",
          glow: "orange",
          discountCode: "URBAN10"
     },
];

// Yearly Big Sale Seasons
const saleSeasons = [
     {
          name: "Republic Day Mega Sale",
          start: "01-20",
          end: "01-26",
          title: "Republic Day Sale",
          text: "Up to 70% OFF! Celebrate with massive seasonal offers.",
          video: republicdayVideo,
          color: "from-blue-700 to-red-600",
          glow: "blue",
          discountCode: "REPUBLIC25"
     },
     {
          name: "Independence Sale",
          start: "08-10",
          end: "08-15",
          title: "Freedom Offers",
          text: "Shop smart, shop free! Independence deals are live.",
          // video: IndependencedayVideo,
          color: "from-green-600 to-orange-500",
          glow: "green",
          discountCode: "FREEDOM20"
     },
     {
name:"Navratre Special Sale",
          start:"09-25",
          end:"10-05",
          title:"Navratre Festive Sale",
          text:"Celebrate Navratre with vibrant offers and festive discounts.",
          // video: NavratreVideo,
          color:"from-pink-500 to-purple-600",
          glow:"pink",
          discountCode: "NAVRATRE15"
     },
     {
          name: "Diwali Super Sale",
          start: "10-20",
          end: "11-05",
          title: "Diwali Dhamaka",
          text: "Festival season = Festival deals! Huge discounts await.",
          // video: DiwaliVideo,
          color: "from-yellow-500 to-red-600",
          glow: "yellow",
          discountCode: "DIWALI30"
     },
     {
          name: "Christmas Bonanza",
          start: "12-15",
          end: "12-26",
          title: "Christmas Sale",
          text: "Jingle all the way to savings! Exclusive Christmas offers.",
          video: ChristmasVideo,
          color: "from-red-600 to-pink-600",
          glow: "red",
          discountCode: "XMAS25"
     }
];

const Collection = () => {
     const [collectionData, setCollectionData] = useState(null);

     const checkSaleSeason = () => {
          const today = new Date();
          const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(
               today.getDate()
          ).padStart(2, "0")}`;

          for (let sale of saleSeasons) {
               if (monthDay >= sale.start && monthDay <= sale.end) {
                    return sale;
               }
          }
          return null;
     };

     useEffect(() => {
          const sale = checkSaleSeason();

          if (sale) {
               setCollectionData(sale);
          } else {
               // Normal Tuesday logic
               const today = new Date();
               const isTuesday = today.getDay() === 2;

               if (isTuesday) {
                    const index = today.getDate() % tuesdayCollections.length;
                    setCollectionData(tuesdayCollections[index]);
               } else {
                    // Default collection
                    setCollectionData({
                         title: "Classic Collection",
                         text: "Discover timeless classics crafted with premium quality.",
                         video: collectionVideo,
                         color: "from-cyan-600 to-blue-600",
                         glow: "cyan",
                         discountCode: "CLASSIC10"
                    });
               }
          }
     }, []);

     if (!collectionData) return null;

     return (
          <section className="py-24 relative bg-[#020617] overflow-hidden">

               {/* Background Glow based on collection type */}
               <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-${collectionData.glow}-600/10 rounded-full blur-[120px] pointer-events-none`}></div>

               <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-wrap lg:flex-nowrap items-center bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                         {/* Video Column */}
                         <div className="w-full lg:w-3/6 relative h-[400px] lg:h-[500px] group">
                              <video
                                   src={collectionData.video}
                                   className="w-full h-full object-cover transition-transform duration-700"
                                   autoPlay
                                   muted
                                   loop
                                   playsInline
                              />

                              {/* Overlay Gradient */}
                              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-transparent to-transparent pointer-events-none"></div>

                              {/* Floating Badge */}
                              <div className={`absolute top-6 left-6 bg-gradient-to-r ${collectionData.color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wide`}>
                                   Featured Drop
                              </div>                     
                         </div>

                         {/* Content Column */}
                         <div className="w-full lg:w-3/6 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#0a0a2e]/60 backdrop-blur-md relative">

                              {/* Decorative Line */}
                              <div className={`w-12 h-1 bg-gradient-to-r ${collectionData.color} mb-6 rounded-full`}></div>

                              <h3 className="text-3xl lg:text-4xl font-extrabold uppercase mb-4 leading-tight">
                                   <span className={`text-transparent bg-clip-text bg-gradient-to-r ${collectionData.color}`}>
                                        {collectionData.title}
                                   </span>
                              </h3>

                              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                   {collectionData.text}
                              </p>

                              <motion.a
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className={`inline-flex items-center justify-center bg-gradient-to-r ${collectionData.color} text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:ring-4 ring-white/20 transition-all duration-300 w-fit cursor-pointer`}
>
  <span className="text-xs font-medium opacity-90 tracking-widest uppercase mr-3">
    Use Code:
  </span>
  <span className="font-black tracking-tight text-lg">
    {collectionData.discountCode ? collectionData.discountCode : "WELCOME50"}
  </span>
</motion.a>
                         </div>

                    </div>
               </div>
          </section>
     );
};

export default Collection;