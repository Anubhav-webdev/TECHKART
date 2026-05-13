import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminProtectKey } from "../constants/adminRoute";
import { motion, AnimatePresence } from "framer-motion"; // Import Framer Motion

const LoginAndSignup = () => {
     const [isSignup, setIsSignup] = useState(false);
     const { login } = useAuth();
     const [showPassword, setShowPassword] = useState(false);
     const [showSignupPassword, setShowSignupPassword] = useState(false);
     const [showSignupConfirm, setShowSignupConfirm] = useState(false);
     const navigate = useNavigate();

     const [loginData, setLoginData] = useState({ identifier: "", password: "" });
     const [signupData, setSignupData] = useState({ username: "", email: "", phone: "", password: "", confirmPassword: "" });
     const [errors, setErrors] = useState({});

     const handleChange = (e, form) => {
          const { name, value } = e.target;
          form === "login" ? setLoginData({ ...loginData, [name]: value }) : setSignupData({ ...signupData, [name]: value });
     };

     // -------------------- YOUR VALIDATIONS & HANDLERS (UNCHANGED) --------------------
     const validateLogin = () => {
          const err = {};
          if (!loginData.identifier.trim()) err.identifier = "Username or Email is required";
          if (!loginData.password.trim()) err.password = "Password is required";
          return err;
     };

     const validateSignup = () => {
          const err = {};
          if (!signupData.username.trim()) err.username = "Username is required";
          if (!signupData.email.trim()) err.email = "Email is required";
          else if (!/^\S+@\S+\.\S+$/.test(signupData.email)) err.email = "Invalid email address";
          if (!signupData.phone.trim()) err.phone = "Phone number is required";
          else if (!/^[0-9]{10}$/.test(signupData.phone)) err.phone = "Phone must be 10 digits";
          if (!signupData.password.trim()) err.password = "Password is required";
          else if (signupData.password.length < 8) err.password = "Password must be at least 8 characters";
          if (!signupData.confirmPassword.trim()) err.confirmPassword = "Confirm your password";
          else if (signupData.password !== signupData.confirmPassword) err.confirmPassword = "Passwords do not match";
          return err;
     };
     const handleLoginSubmit = async (e) => {
          e.preventDefault();
          const validation = validateLogin();
          setErrors(validation);
          if (Object.keys(validation).length === 0) {
               try {
                    const res = await fetch("http://localhost:7000/api/auth/login", {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify(loginData)
                    });
                    const data = await res.json();
                    if (!res.ok) return alert(data.message || "Login failed");
                    const loggedInUser = { id: data.user._id || data.user.id, username: data.user.username, email: data.user.email, phone: data.user.phone, role: data.user.role || "user" };
                    login(loggedInUser);
                    localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
                    alert(`🎉 Welcome Back! ${loggedInUser.username}`);
                    if (loggedInUser.role === "admin") navigate(`/${adminProtectKey}/admin`); // admin path uses shared protect key
                    else navigate("/");
               } catch (err) { alert("Server error, try again later"); }
          }
     };

     const handleSignupSubmit = async (e) => {
          e.preventDefault();
          const validation = validateSignup();
          setErrors(validation);
          if (Object.keys(validation).length === 0) {
               try {
                    const res = await fetch("http://localhost:7000/api/auth/signup", {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({ username: signupData.username, email: signupData.email, phone: signupData.phone, password: signupData.password })
                    });
                    const data = await res.json();
                    if (!res.ok) return alert(data.message || "Signup failed");
                    const newUser = { id: data.user._id || data.user.id, username: data.user.username, email: data.user.email, phone: data.user.phone, role: data.user.role || "user" };
                    login(newUser);
                    localStorage.setItem("loggedInUser", JSON.stringify(newUser));
                    alert("Account created successfully 🎉");
                    navigate("/");
               } catch (err) { alert("Server error, try again later"); }
          }
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden p-4">

               {/* Animated Background Blobs */}
               <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px] animate-pulse" />
               <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />

               <motion.div
                    layout // This animates the card size change automatically
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl text-white z-10"
               >
                    <motion.h1
                         key={isSignup ? "signup" : "login"}
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="text-center text-3xl font-extrabold mb-8 tracking-tight text-white"
                    >
                         {isSignup ? "Create Account" : "Welcome Back"}
                    </motion.h1>

                    {/* Animated Toggle Switch */}
                    <div className="flex mb-8 p-1 bg-black/40 rounded-xl relative border border-white/5">
                         <motion.div
                              animate={{ x: isSignup ? "100%" : "0%" }}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              className="absolute top-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-white/10 rounded-lg"
                         />
                         <button
                              className={`w-1/2 py-2.5 text-sm font-bold z-10 transition-colors ${!isSignup ? "text-cyan-400" : "text-gray-400"}`}
                              onClick={() => { setErrors({}); setIsSignup(false); }}
                         >
                              Login
                         </button>
                         <button
                              className={`w-1/2 py-2.5 text-sm font-bold z-10 transition-colors ${isSignup ? "text-cyan-400" : "text-gray-400"}`}
                              onClick={() => { setErrors({}); setIsSignup(true); }}
                         >
                              Sign Up
                         </button>
                    </div>

                    <AnimatePresence mode="wait">
                         {!isSignup ? (
                              <motion.form
                                   key="loginForm"
                                   initial={{ opacity: 0, x: -20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   exit={{ opacity: 0, x: 20 }}
                                   onSubmit={handleLoginSubmit}
                                   className="space-y-4"
                              >
                                   <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Identifier</label>
                                        <input
                                             type="text"
                                             name="identifier"
                                             placeholder="Username or email"
                                             value={loginData.identifier}
                                             onChange={(e) => handleChange(e, "login")}
                                             className="w-full p-3.5 mt-1 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                        />
                                        {errors.identifier && <p className="text-red-400 text-xs mt-1 ml-1">{errors.identifier}</p>}
                                   </div>

                                   <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                                        <div className="relative">
                                             <input
                                                  type={showPassword ? "text" : "password"}
                                                  name="password"
                                                  placeholder="••••••••"
                                                  value={loginData.password}
                                                  onChange={(e) => handleChange(e, "login")}
                                                  className="w-full p-3.5 mt-1 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                             />
                                             <button
                                                  type="button"
                                                  className="absolute right-4 top-5 text-gray-500 hover:text-white transition"
                                                  onClick={() => setShowPassword(!showPassword)}
                                             >
                                                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                                             </button>
                                        </div>
                                        {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password}</p>}
                                   </div>

                                   <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full py-4 mt-4 bg-white text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-lg shadow-white/5"
                                   >
                                        Sign In
                                   </motion.button>
                              </motion.form>
                         ) : (
                              <motion.form
                                   key="signupForm"
                                   initial={{ opacity: 0, x: 20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   exit={{ opacity: 0, x: -20 }}
                                   onSubmit={handleSignupSubmit}
                                   className="space-y-3"
                              >
                                   <SignupInput label="Username" name="username" value={signupData.username} error={errors.username} onChange={handleChange} placeholder="user" />
                                   <SignupInput label="Email" name="email" type="email" value={signupData.email} error={errors.email} onChange={handleChange} placeholder="user@example.com" />
                                   <SignupInput label="Phone" name="phone" type="tel" value={signupData.phone} error={errors.phone} onChange={handleChange} placeholder="1234567890" />

                                   <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                             <input
                                                  type={showSignupPassword ? "text" : "password"}
                                                  name="password"
                                                  placeholder="Password"
                                                  value={signupData.password}
                                                  onChange={(e) => handleChange(e, "signup")}
                                                  className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50"
                                             />
                                             <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-3 top-4 text-gray-500"><FaEye size={14} /></button>
                                        </div>
                                        <div className="relative">
                                             <input
                                                  type={showSignupConfirm ? "text" : "password"}
                                                  name="confirmPassword"
                                                  placeholder="Confirm"
                                                  value={signupData.confirmPassword}
                                                  onChange={(e) => handleChange(e, "signup")}
                                                  className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50"
                                             />
                                             <button type="button" onClick={() => setShowSignupConfirm(!showSignupConfirm)} className="absolute right-3 top-4 text-gray-500"><FaEye size={14} /></button>
                                        </div>
                                   </div>
                                   {(errors.password || errors.confirmPassword) && <p className="text-red-400 text-xs ml-1">{errors.password || errors.confirmPassword}</p>}

                                   <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full py-4 mt-2 bg-cyan-500 text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-cyan-500/20"
                                   >
                                        Create Account
                                   </motion.button>
                              </motion.form>
                         )}
                    </AnimatePresence>
               </motion.div>
          </div>
     );
};

// Helper component for Signup fields to keep main code clean
const SignupInput = ({ label, name, type = "text", value, error, onChange, placeholder }) => (
     <div>
          <input
               type={type}
               name={name}
               placeholder={placeholder}
               value={value}
               onChange={(e) => onChange(e, "signup")}
               className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
          />
          {error && <p className="text-red-400 text-[10px] mt-1 ml-1">{error}</p>}
     </div>
);

export default LoginAndSignup;