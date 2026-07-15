import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config/apiConfig";

const AuthContext = createContext();

const trackUserVisit = async (userData) => {
     if (typeof window === "undefined") return;
     if (!userData?.id && !userData?._id) return;

     const normalizedUser = {
          id: userData.id || userData._id,
          username: userData.username || "",
     };

     try {
          await fetch(`${API_BASE_URL}/visits/track`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                    userId: normalizedUser.id,
                    username: normalizedUser.username,
                    page: window.location.pathname,
                    location: navigator.language || "Unknown",
                    userAgent: navigator.userAgent,
               }),
          });
     } catch (error) {
          console.warn("Visit tracking failed:", error);
     }
};

export const AuthProvider = ({ children }) => {
     const [user, setUser] = useState(null);

     useEffect(() => {
          const storedUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");
          if (storedUser) {
               if (!storedUser.id && storedUser._id) storedUser.id = storedUser._id;
               setUser(storedUser);
               trackUserVisit(storedUser);
          }
     }, []);

     const login = (userData) => {
          if (!userData.id && userData._id) userData.id = userData._id;
          setUser(userData);
          localStorage.setItem("loggedInUser", JSON.stringify(userData));
          trackUserVisit(userData);
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
