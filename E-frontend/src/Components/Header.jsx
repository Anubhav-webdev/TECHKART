import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/images/logo.png";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { adminProtectKey } from "../constants/adminRoute";
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
  Cart,
  BreakingNewsPage,
} from "../routeComponents";


import {
     FaUser,
     FaHeart,
     FaShoppingCart,
     FaChevronDown,
     FaHome,
     FaNewspaper,
     FaInfoCircle,
     FaMobileAlt,
     FaLaptop,
     FaTabletAlt,
     FaBook,
     FaTshirt,
} from "react-icons/fa";

const Header = () => {
     const { user, logout } = useAuth();
     const { wishlistItems } = useWishlist();
     const { cart } = useCart();

     const [isShopOpen, setIsShopOpen] = useState(false);
     const [isUserOpen, setIsUserOpen] = useState(false);
     const [isMenuOpen, setIsMenuOpen] = useState(false);

     const navRef = useRef(null);
     const userRef = useRef(null);

     useEffect(() => {
          const handleClickOutside = (e) => {
               if (navRef.current && !navRef.current.contains(e.target)) setIsShopOpen(false);
               if (userRef.current && !userRef.current.contains(e.target)) setIsUserOpen(false);
          };
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
     }, []);

     const navLinks = [
          { name: "Home", to: "/", icon: FaHome },
          { name: "Blog", to: "/blog", icon: FaNewspaper, preload: Blog.preload },
          { name: "Info", to: "/info", icon: FaInfoCircle, preload: Info.preload },
     ];

     const shopLinks = [
          { name: "Mobiles", to: "/shop/mobiles", icon: FaMobileAlt, preload: Mobile.preload },
          { name: "Laptops", to: "/shop/laptops", icon: FaLaptop, preload: Laptop.preload },
          { name: "Gadgets", to: "/shop/gadgets", icon: FaTabletAlt, preload: Gadgets.preload },
          { name: "Books", to: "/shop/books", icon: FaBook, preload: Books.preload },
          { name: "T-Shirts", to: "/shop/t-shirts", icon: FaTshirt, preload: TShirts.preload },
     ];

     const prefetchShopRoutes = () => {
          Mobile.preload();
          Laptop.preload();
          Gadgets.preload();
          Books.preload();
          TShirts.preload();
     };

     return (
          <nav
               className="
               fixed top-0 w-full z-40 
               bg-slate-900/80 backdrop-blur-xl
               border-b border-slate-700 shadow-lg
               transition-all duration-300"
               ref={navRef}
          >
               <div className="container mx-auto px-4 h-20 flex items-center justify-between">

                    {/* Logo */}
                    <NavLink to="/" className="flex items-center gap-3 group">
                         <div className="relative">
                              <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 group-hover:opacity-40 transition"></div>
                              <img src={logo} alt="Logo" className="w-10 h-10 relative z-10 rounded-lg" />
                         </div>
                         <span className="text-2xl font-bold tracking-wider text-white group-hover:text-cyan-400 transition">
                              TECH<span className="text-cyan-400">KART</span>
                         </span>
                    </NavLink>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-6">
                         {navLinks.map((link) => (
                              <NavLink
                                   key={link.name}
                                   to={link.to}
                                   onMouseEnter={link.preload}
                                   className={({ isActive }) =>
                                        `px-4 py-2 rounded-full text-sm font-medium transition 
                                        ${isActive
                                             ? "bg-cyan-600 text-white shadow-lg"
                                             : "text-gray-300 hover:text-white hover:bg-slate-800"}`}
                              >
                                   <link.icon className="inline-block mr-2 opacity-70" />
                                   {link.name}
                              </NavLink>
                         ))}

                         {/* Shop */}
                         <div className="relative">
                              <button
                                   onClick={() => setIsShopOpen((o) => !o)}
                                   onMouseEnter={prefetchShopRoutes}
                                   className="flex items-center gap-1 text-gray-300 hover:text-cyan-400 transition"
                              >
                                   Shop <FaChevronDown className={`transition transform ${isShopOpen ? "rotate-180" : ""}`} />
                              </button>

                              <div
                                   className={`
                                   absolute left-0 mt-3 w-56 
                                   bg-slate-800 border border-slate-700 backdrop-blur-xl
                                   rounded-xl shadow-xl overflow-hidden
                                   transition-all duration-300 origin-top
                                   ${isShopOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}
                                   `}
                              >
                                   {shopLinks.map((link) => (
                                        <NavLink
                                             key={link.name}
                                             to={link.to}
                                             onMouseEnter={link.preload}
                                             className="px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-cyan-400 flex items-center gap-2"
                                        >
                                             <link.icon className="opacity-70" /> {link.name}
                                        </NavLink>
                                   ))}
                              </div>
                         </div>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center gap-5">

                         {/* Wishlist */}
                         <NavLink onMouseEnter={Wishlist.preload} className="relative text-gray-300 hover:text-red-500 transition hidden lg:block" to="/wishlist">
                              <FaHeart className="w-5 h-5" />
                              {wishlistItems.length > 0 && (
                                   <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full text-[10px] text-white flex items-center justify-center">
                                        {wishlistItems.length}
                                   </span>
                              )}
                         </NavLink>

                         {/* Cart */}
                         <NavLink onMouseEnter={Cart.preload} className="relative text-gray-300 hover:text-cyan-400 transition hidden lg:block" to="/cart">
                              <FaShoppingCart className="w-5 h-5" />
                              {cart.length > 0 && (
                                   <span className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-600 rounded-full text-[10px] text-white flex items-center justify-center">
                                        {cart.length}
                                   </span>
                              )}
                         </NavLink>

                         {/* User Dropdown */}
                         <div className="relative" ref={userRef}>
                              <button
                                   onClick={() => setIsUserOpen((o) => !o)}
                                   className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg hover:shadow-cyan-500/50 transition"
                              >
                                   {user ? user.username.charAt(0).toUpperCase() : <FaUser />}
                              </button>

                              <div
                                   className={`
                                   absolute right-0 mt-3 w-60 bg-slate-800 border border-slate-700 
                                   rounded-xl shadow-xl transition-all duration-300 origin-top
                                   ${isUserOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
                                   `}
                              >
                                   {!user ? (
                                        <NavLink
                                             to="/LoginAndSignup"
                                             className="block px-4 py-2 text-cyan-400 hover:bg-slate-700"
                                             onClick={() => setIsUserOpen(false)}
                                             onMouseEnter={LoginAndSignup.preload}
                                        >
                                             Login / Signup
                                        </NavLink>
                                   ) : (
                                        <>
                                             <div className="px-4 py-3 border-b border-slate-700">
                                                  <p className="text-white font-bold">{user.username}</p>
                                                  <p className="text-xs text-gray-400">{user.email}</p>
                                             </div>

                                             <NavLink
                                                  to="/profile"
                                                  className="block px-4 py-2 text-gray-300 hover:bg-slate-700"
                                                  onClick={() => setIsUserOpen(false)}
                                                  onMouseEnter={Profile.preload}
                                             >
                                                  Profile
                                             </NavLink>

                                             {user.role === "admin" && (
                                                  <NavLink
                                                       to={`/${adminProtectKey}/admin`}
                                                       className="block px-4 py-2 text-gray-300 hover:bg-slate-700"
                                                       onClick={() => setIsUserOpen(false)}
                                                  >
                                                       Admin Panel
                                                  </NavLink>
                                             )}

                                             <button
                                                  onClick={() => {
                                                       logout();
                                                       setIsUserOpen(false);
                                                  }}
                                                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/20"
                                             >
                                                  Logout
                                             </button>
                                        </>
                                   )}
                              </div>
                         </div>

                         {/* Mobile Menu Button */}
                         <button
                              className="lg:hidden text-gray-300 hover:text-cyan-400 transition"
                              onClick={() => setIsMenuOpen((o) => !o)}
                         >
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                              </svg>
                         </button>

                         {/* Mobile Dropdown */}
                         {isMenuOpen && (
                              <div className="absolute top-full  text-black  p-4 flex flex-col gap-2  animate-slideIn lg:hidden  right-0 mt-3 w-40 bg-slate-800 border border-slate-700 
                                   rounded-xl shadow-xl transition-all duration-300 origin-top">
                                   <NavLink to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-blue-500">Home</NavLink>
                                   <NavLink to="/blog" onMouseEnter={Blog.preload} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-blue-500">Blog</NavLink>
                                   <NavLink to="/info" onMouseEnter={Info.preload} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-blue-500">Info</NavLink>
                                   <NavLink to="/shop/mobiles" onMouseEnter={Mobile.preload} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-blue-500">Mobile</NavLink>
                                   <NavLink to="/shop/laptops" onMouseEnter={Laptop.preload} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-blue-500" >Laptops</NavLink>
                                   <NavLink to="/shop/gadgets" onMouseEnter={Gadgets.preload} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-blue-500">Gadgets</NavLink>
                                   <NavLink to="/shop/books" onMouseEnter={Books.preload} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-blue-500">Books</NavLink>
                                   <NavLink to="/shop/t-shirts" onMouseEnter={TShirts.preload} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-blue-500">T-Shirts</NavLink>
                                   <NavLink to="/cart" onMouseEnter={Cart.preload} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-blue-500">Cart</NavLink>
                                   <NavLink to="/wishlist" onMouseEnter={Wishlist.preload} onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-blue-500">Wishlist</NavLink>
                              </div>
                         )}
                    </div>
               </div>
          </nav>

     );
};

export default Header;
