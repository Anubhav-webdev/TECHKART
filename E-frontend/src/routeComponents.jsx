import { lazy } from "react";

function lazyWithPreload(factory) {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
}

export const Mobile = lazyWithPreload(() => import("./MainComponents/Mobile"));
export const Laptop = lazyWithPreload(() => import("./MainComponents/laptop.jsx"));
export const Gadgets = lazyWithPreload(() => import("./MainComponents/gadgets.jsx"));
export const Books = lazyWithPreload(() => import("./MainComponents/Book.jsx"));
export const TShirts = lazyWithPreload(() => import("./MainComponents/t-shirts.jsx"));
export const Wishlist = lazyWithPreload(() => import("./MainComponents/wishlist"));
export const Blog = lazyWithPreload(() => import("./MainComponents/blog.jsx"));
export const LoginAndSignup = lazyWithPreload(() => import("./MainComponents/LoginAndSignup.jsx"));
export const Info = lazyWithPreload(() => import("./MainComponents/Info.jsx"));
export const Profile = lazyWithPreload(() => import("./MainComponents/Profile.jsx"));
export const OrderTracking = lazyWithPreload(() => import("./MainComponents/OrderTracking.jsx"));
export const Cart = lazyWithPreload(() => import("./MainComponents/cart.jsx"));
export const BreakingNewsPage = lazyWithPreload(() => import("./MainComponents/News/NewsPage.jsx"));
export const AdminDashboard = lazyWithPreload(() => import("./MainComponents/admin.jsx"));
