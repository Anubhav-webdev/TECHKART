import React, { useEffect, Suspense, lazy } from "react";
import { FaStar, FaMobileAlt, FaLaptop, FaCogs, FaBook, FaTshirt } from "react-icons/fa";

// Critical above-the-fold components - loaded immediately
import Services from "./Components/Services";
import ProductCarousel from "./Components/ProductCarousel";
import AnimateOnScroll from "./Components/AnimateOnScroll";
import HeroSection from "./Components/HeroSection";

// Below-the-fold components - lazy loaded for faster initial page load
const Collection = lazy(() => import("./Components/Collection"));
const News = lazy(() => import("./MainComponents/News/News.jsx"));
const Testimonials = lazy(() => import("./Components/Testimonials"));
const Blog = lazy(() => import("./Components/Blog"));
const Brands = lazy(() => import("./Components/Brands"));
const Instagram = lazy(() => import("./Components/Instagram"));

// Loading skeleton component for lazy sections
const SectionLoader = () => (
  <div className="h-96 bg-gradient-to-b from-[#020617] to-[#0f172a] animate-pulse flex items-center justify-center">
    <div className="h-12 w-12 border-t-2 border-cyan-400 rounded-full animate-spin"></div>
  </div>
);

function App() {
  useEffect(() => {
    document.title = "TechKart | Your Ultimate Tech Store";
  }, []);

  // Shared classes for section titles to ensure they pop on the dark background
  const titleStyle = "flex items-center gap-3 text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-400";
  const iconStyle = "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]";

  return (
    <div className="font-orbitron bg-[#020617] min-h-screen text-gray-100 overflow-x-hidden">
      {/* ABOVE-THE-FOLD - Critical Components (Immediately Loaded) */}
      <HeroSection />

      <main className="relative z-10">
        {/* Services Section */}
        <AnimateOnScroll>
          <Services />
        </AnimateOnScroll>

        {/* Featured Products - Visible on load */}
        <AnimateOnScroll>
          <ProductCarousel
            title={
              <span className={titleStyle}>
                <FaStar className={`text-yellow-400 ${iconStyle}`} /> Featured Products
              </span>
            }
            featured={true}
          />
        </AnimateOnScroll>

        {/* Mobile Products */}
        <AnimateOnScroll>
          <ProductCarousel
            title={
              <span className={titleStyle}>
                <FaMobileAlt className={`text-blue-400 ${iconStyle}`} /> Mobile Products
              </span>
            }
            category="mobile"
          />
        </AnimateOnScroll>

        {/* Laptop Products */}
        <AnimateOnScroll>
          <ProductCarousel
            title={
              <span className={titleStyle}>
                <FaLaptop className={`text-emerald-400 ${iconStyle}`} /> Laptop Products
              </span>
            }
            category="laptop"
          />
        </AnimateOnScroll>

        {/* Gadget Products */}
        <AnimateOnScroll>
          <ProductCarousel
            title={
              <span className={titleStyle}>
                <FaCogs className={`text-purple-400 ${iconStyle}`} /> Gadget Products
              </span>
            }
            category="gadget"
          />
        </AnimateOnScroll>

        {/* BELOW-THE-FOLD - Lazy Loaded Components (Code Split) */}

        {/* Collection - Lazy Loaded */}
        <Suspense fallback={<SectionLoader />}>
          <AnimateOnScroll>
            <Collection />
          </AnimateOnScroll>
        </Suspense>

        {/* Book Products */}
        <AnimateOnScroll>
          <ProductCarousel
            title={
              <span className={titleStyle}>
                <FaBook className={`text-orange-400 ${iconStyle}`} /> Book Products
              </span>
            }
            category="book"
          />
        </AnimateOnScroll>

        {/* T-shirt Products */}
        <AnimateOnScroll>
          <ProductCarousel
            title={
              <span className={titleStyle}>
                <FaTshirt className={`text-pink-400 ${iconStyle}`} /> T-shirt Products
              </span>
            }
            category="t-shirt"
          />
        </AnimateOnScroll>

        {/* News - Lazy Loaded */}
        <Suspense fallback={<SectionLoader />}>
          <AnimateOnScroll>
            <News />
          </AnimateOnScroll>
        </Suspense>

        {/* Testimonials - Lazy Loaded */}
        <Suspense fallback={<SectionLoader />}>
          <AnimateOnScroll>
            <Testimonials />
          </AnimateOnScroll>
        </Suspense>

        {/* Blog - Lazy Loaded */}
        <Suspense fallback={<SectionLoader />}>
          <AnimateOnScroll>
            <Blog />
          </AnimateOnScroll>
        </Suspense>

        {/* Brands - Lazy Loaded */}
        <Suspense fallback={<SectionLoader />}>
          <AnimateOnScroll>
            <Brands />
          </AnimateOnScroll>
        </Suspense>

        {/* Instagram - Lazy Loaded */}
        <Suspense fallback={<SectionLoader />}>
          <AnimateOnScroll>
            <Instagram />
          </AnimateOnScroll>
        </Suspense>
      </main>
    </div>
  );
}

export default App;

