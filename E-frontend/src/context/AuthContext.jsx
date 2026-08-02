import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig";

const AuthContext = createContext();

const trackUserVisit = async (userData, extra = {}) => {
     if (typeof window === "undefined") return;
     if (!userData?.id && !userData?._id) return;

     const normalizedUser = {
          id: userData.id || userData._id,
          username: userData.username || "",
     };

     const payload = {
          userId: normalizedUser.id,
          username: normalizedUser.username,
          page: extra.page || window.location.pathname,
          pageTitle: extra.pageTitle || document.title || "TechKart",
          durationSeconds: extra.durationSeconds || 0,
          location: extra.location || navigator.language || "Unknown",
          userAgent: navigator.userAgent,
          ipAddress: extra.ipAddress || "",
     };

     try {
          await fetch(`${API_BASE_URL}/visits/track`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(payload),
          });
     } catch (error) {
          console.warn("Visit tracking failed:", error);
     }
};

export const AuthProvider = ({ children }) => {
     const [user, setUser] = useState(null);
     const location = useLocation();
     const pageStartRef = useRef(Date.now());
     const currentPageRef = useRef(location.pathname);

     const getElapsedSeconds = () => Math.max(0, Math.floor((Date.now() - pageStartRef.current) / 1000));

     const flushCurrentPage = useCallback(async (page = currentPageRef.current, durationSeconds = getElapsedSeconds()) => {
          if (!user) return;
          if (!page) return;

          const payload = {
               page,
               durationSeconds,
               pageTitle: document.title || "TechKart",
          };

          if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
               const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
               navigator.sendBeacon(`${API_BASE_URL}/visits/track`, blob);
               return;
          }

          await trackUserVisit(user, payload);
     }, [user]);

     useEffect(() => {
          const storedUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
          if (storedUser) {
               if (!storedUser.id && storedUser._id) storedUser.id = storedUser._id;
               setUser(storedUser);
               trackUserVisit(storedUser, { page: location.pathname, pageTitle: document.title || "TechKart" });
          }
     }, [location.pathname]);

     useEffect(() => {
          if (!user) return;

          const previousPage = currentPageRef.current;
          const previousDuration = getElapsedSeconds();

          if (previousPage && previousPage !== location.pathname) {
               flushCurrentPage(previousPage, previousDuration);
          }

          currentPageRef.current = location.pathname;
          pageStartRef.current = Date.now();

          trackUserVisit(user, {
               page: location.pathname,
               pageTitle: document.title || "TechKart",
               durationSeconds: 0,
          });
     }, [user, location.pathname, flushCurrentPage]);

     useEffect(() => {
          if (!user) return;

          const handleVisibilityChange = () => {
               if (document.visibilityState === "hidden") {
                    flushCurrentPage(currentPageRef.current, getElapsedSeconds());
               } else {
                    pageStartRef.current = Date.now();
               }
          };

          const handleBeforeUnload = () => {
               flushCurrentPage(currentPageRef.current, getElapsedSeconds());
          };

          document.addEventListener("visibilitychange", handleVisibilityChange);
          window.addEventListener("beforeunload", handleBeforeUnload);
          window.addEventListener("pagehide", handleBeforeUnload);

          return () => {
               document.removeEventListener("visibilitychange", handleVisibilityChange);
               window.removeEventListener("beforeunload", handleBeforeUnload);
               window.removeEventListener("pagehide", handleBeforeUnload);
          };
     }, [user, flushCurrentPage]);

     const login = (userData) => {
          if (!userData.id && userData._id) userData.id = userData._id;
          setUser(userData);
          localStorage.setItem("loggedInUser", JSON.stringify(userData));
          trackUserVisit(userData, { page: location.pathname, pageTitle: document.title || "TechKart" });
     };

     const logout = () => {
          setUser(null);
          localStorage.removeItem("loggedInUser");
     };

     return (
          <AuthContext.Provider value={{ user, login, logout }}>
               {children}
          </AuthContext.Provider>
     );
};

export const useAuth = () => useContext(AuthContext);
