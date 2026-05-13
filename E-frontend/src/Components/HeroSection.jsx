import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt, FaCloudSun,FaWind } from "react-icons/fa";

import hero1 from '../assets/images/hero1.png';
import hero2 from '../assets/images/hero.png';
import hero3 from '../assets/images/hero3.png';

const slides = [
  { id: 1, title: "Samsung S25 Ultra", subtitle: "Titanium frame meeting raw AI power.", image: hero1, color: "from-purple-600 to-blue-600", features: ["200MP Lens", "Snapdragon 8 Gen 4"] },
  { id: 2, title: "MacBook Air M4", subtitle: "Impossibly thin. Incredibly fast.", image: hero2, color: "from-orange-500 to-red-500", features: ["M4 Silicon", "Liquid Retina"] },
  { id: 3, title: "Fire-Boltt Hurricane", subtitle: "Sharp and elegant design", image: hero3, color: "from-cyan-500 to-teal-500", features: ["Smart Functions", "Compatibility"] }
];

function DarkTechSlider() {

  const [index, setIndex] = useState(0);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => setIndex((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(interval);
  }, []);

  // HIGH ACCURACY GPS ONLY
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watch = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
          setErrorMsg(null);
          setLoading(false);
        },
        (err) => {
          setErrorMsg("Location Permission Denied / GPS Off");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        }
      );

      return () => navigator.geolocation.clearWatch(watch);
    } else {
      setErrorMsg("Geolocation not supported");
      setLoading(false);
    }
  }, []);

  // Reverse Geocode
  useEffect(() => {
    if (location) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
      )
        .then(res => res.json())
        .then(data => {
          const a = data.address;
          setAddress({
            city: a.city || a.town || a.village || "Nearby",
            state: a.state || "",
            pincode: a.postcode || "",
            area: a.suburb || a.neighbourhood || a.road || "",
            full: `${a.house_number || ""} ${a.road || ""}, ${a.suburb || ""}, ${a.city || ""}, ${a.state || ""} - ${a.postcode || ""}`
          });
        });
    }
  }, [location]);

  // Weather
  useEffect(() => {
    if (location) {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current_weather=true`
      )
        .then(res => res.json())
        .then(data => {
          setWeather({
            temp: data.current_weather?.temperature,
            wind: data.current_weather?.windspeed
          });
        });
    }
  }, [location]);

  return (
    <div className="flex flex-col w-full bg-[#050505] min-h-screen">

{/* ---------------- COMPACT NAV ---------------- */}
<nav className="w-full pt-2 pb-1 px-6 md:px-14  mt-20">
  <div className="max-w-8xl mx-auto flex items-center justify-between border-b border-white/5">


    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="absolute -inset-1 bg-blue-600/40 rounded-full blur opacity-30"></div>
        <div className="relative p-2.5 bg-black border border-white/10 rounded-full">
          <FaMapMarkerAlt className="text-blue-400 text-base" />
        </div>
      </div>

      <div className="flex flex-col leading-tight">

        {loading ? (
          <span className="text-slate-500 text-xs animate-pulse">
            Getting Accurate Location...
          </span>
        ) : errorMsg ? (
          <span className="text-red-500 text-sm">{errorMsg}</span>
        ) : address ? (
          <>
            <div className="text-sm text-white flex items-center gap-2">
              <span>{address.city}</span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-400">{address.state}</span>
              <span className="text-slate-700">|</span>
              <span className="text-blue-400">{address.pincode}</span>
            </div>

            <span className="text-[11px] text-slate-400">
              {address.full}
            </span>

            {location?.accuracy && (
              <span className="text-[11px] text-green-400">
                Accuracy: ± {Math.round(location.accuracy)} meters
              </span>
            )}
          </>
        ) : (
          <span className="text-red-500 text-sm">
            Location Failed
          </span>
        )}
      </div>
    </div>

    {/* Weather */}
    {weather && (
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white">
        <FaCloudSun className="text-yellow-400" />
        {weather.temp}°C
            <span className="text-slate-500">|</span>
           <FaWind className="text-gray-400" /> {weather.wind} km/h
      </div>
    )}
  </div>
</nav>

{/* ---------------- HERO SLIDER ---------------- */}
<main className="flex-grow flex items-center">
  <AnimatePresence mode="wait">
    <motion.div
      key={slides[index].id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto px-6 md:px-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
    >

      <div>
        <h2 className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-red-400 uppercase mb-5">
          TechKart Exclusive
        </h2>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
          {slides[index].title}
        </h1>

        <p className="text-lg text-slate-400 mb-8">
          {slides[index].subtitle}
        </p>

        <div className="flex gap-3 flex-wrap">
          {slides[index].features.map((f,i)=>(
            <div key={i} className="px-4 py-2 bg-white/5 border border-white/10 text-[11px] rounded-full text-slate-300">
              {f}
            </div>
          ))}
        </div>
      </div>

<div className="relative flex justify-center">
  <motion.div
    className={`absolute inset-0 bg-gradient-to-tr ${slides[index].color} blur-[80px] opacity-25 rounded-full`}
  />
  <motion.img
    src={slides[index].image}
    className="relative z-10 w-full max-w-[430px]"
  />
</div>
    </motion.div>
  </AnimatePresence>
</main>

</div>
  );
}

export default DarkTechSlider;
