import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Critical imports - loaded immediately
import Layout from "./MainComponents/layout.jsx";
import App from "./App.jsx";
import AnimateOnScroll from "./Components/AnimateOnScroll";
import { adminProtectKey } from "./constants/adminRoute";

// Context providers - loaded immediately
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from "./context/CartContext.jsx";
import { StockProvider } from "./context/StockContext";
import { AuthProvider } from "./context/AuthContext";

// Lazy loaded route components - code split into separate chunks
import {
  Mobile,
  Laptop,
  Gadgets,
  Books,
  TShirts,
  Wishlist,
  Blog,
  LoginAndSignup,
  Info,
  Profile,
  OrderTracking,
  Cart,
  AdminDashboard,
  BreakingNewsPage,
} from "./routeComponents";

// Loading fallback component
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#020617]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
  </div>
);


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StockProvider>
          <CartProvider>
            <WishlistProvider>

              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<App />} />

                  {/* Shop Routes - Lazy loaded with Suspense */}
                  <Route path="/shop/mobiles" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><Mobile /></AnimateOnScroll></Suspense>} />
                  <Route path="/shop/laptops" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><Laptop /></AnimateOnScroll></Suspense>} />
                  <Route path="/shop/gadgets" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><Gadgets /></AnimateOnScroll></Suspense>} />
                  <Route path="/shop/books" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><Books /></AnimateOnScroll></Suspense>} />
                  <Route path="/shop/t-shirts" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><TShirts /></AnimateOnScroll></Suspense>} />

                  {/* User Routes - Lazy loaded with Suspense */}
                  <Route path="/wishlist" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><Wishlist /></AnimateOnScroll></Suspense>} />
                  <Route path="/LoginAndSignup" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><LoginAndSignup /></AnimateOnScroll></Suspense>} />
                  <Route path="/blog" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><Blog /></AnimateOnScroll></Suspense>} />
                  <Route path="/info" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><Info /></AnimateOnScroll></Suspense>} />
                  <Route path="/cart" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><Cart /></AnimateOnScroll></Suspense>} />
                  <Route path="/profile" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><Profile /></AnimateOnScroll></Suspense>} />
                  <Route path="/tracking" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><OrderTracking /></AnimateOnScroll></Suspense>} />
                  <Route path="/news" element={<Suspense fallback={<PageLoader />}><AnimateOnScroll><BreakingNewsPage /></AnimateOnScroll></Suspense>} />
                </Route>

                {/* Admin Routes - Lazy loaded with Suspense */}
                <Route
                  path="/admin"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AnimateOnScroll>
                        <AdminDashboard />
                      </AnimateOnScroll>
                    </Suspense>
                  }
                />
                <Route
                  path={`/${adminProtectKey}`}
                  element={<Navigate to={`/${adminProtectKey}/admin`} replace />}
                />
                <Route
                  path={`/${adminProtectKey}/admin`}
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AnimateOnScroll>
                        <AdminDashboard />
                      </AnimateOnScroll>
                    </Suspense>
                  }
                />
              </Routes>

            </WishlistProvider>
          </CartProvider>
        </StockProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
