import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Critical imports - loaded immediately
import Layout from "./MainComponents/Layout.jsx";
import App from "./App.jsx";
import AnimateOnScroll from "./Components/AnimateOnScroll";
import { adminProtectKey } from "./constants/adminRoute";

// Context providers - loaded immediately
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from "./context/CartContext.jsx";
import { StockProvider } from "./context/StockContext";
import { AuthProvider } from "./context/AuthContext";

// Lazy loaded route components - code split into separate chunks
const Mobile = lazy(() => import("./MainComponents/Mobile"));
const Laptop = lazy(() => import("./MainComponents/laptop.jsx"));
const Gadgets = lazy(() => import("./MainComponents/gadgets.jsx"));
const Books = lazy(() => import("./MainComponents/Book.jsx"));
const TShirts = lazy(() => import("./MainComponents/t-shirts.jsx"));
const Wishlist = lazy(() => import("./MainComponents/wishlist"));
const Blog = lazy(() => import("./MainComponents/blog.jsx"));
const LoginAndSignup = lazy(() => import("./MainComponents/LoginAndSignup.jsx"));
const Info = lazy(() => import("./MainComponents/Info.jsx"));
const Profile = lazy(() => import("./MainComponents/Profile.jsx"));
const OrderTracking = lazy(() => import("./MainComponents/OrderTracking.jsx"));
const Cart = lazy(() => import("./MainComponents/cart.jsx"));
const AdminDashboard = lazy(() => import("./MainComponents/admin.jsx"));
const BreakingNewsPage = lazy(() => import("./MainComponents/News/NewsPage.jsx"));

// Loading fallback component
const PageLoader = () => (
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
