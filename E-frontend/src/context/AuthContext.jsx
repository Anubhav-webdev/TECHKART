import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
     const [user, setUser] = useState(null);

     // Load user from localStorage on app start
     useEffect(() => {
          const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
          if (loggedInUser) {
               // Ensure 'id' exists even if server returned '_id'
               if (!loggedInUser.id && loggedInUser._id) loggedInUser.id = loggedInUser._id;
               setUser(loggedInUser);
          }
     }, []);

     const login = (userData) => {
          if (!userData.id && userData._id) userData.id = userData._id;
          setUser(userData);
          localStorage.setItem("loggedInUser", JSON.stringify(userData));
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
