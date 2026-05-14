import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import CountUp from "react-countup";
import { API_BASE_URL } from "../config/apiConfig";
import {
  FaBox, FaTshirt, FaBook, FaNewspaper, FaArrowLeft,
  FaHome, FaSync, FaChartLine, FaShoppingBag, FaGhost, FaTerminal
} from "react-icons/fa";

import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from "recharts";

// Sub modules (Assumed existing)
import AdminBlogAdd from "./AdminBlogAdd";
import AdminTShirtsAdd from "./AdminTshirtsAdd";
import AdminProductsAdd from "./AdminProductsAdd";
import AdminBookAdd from "./AdminBookAdd";

// ================= THEMED PALETTE STYLES =================
const styles = {
  // Deep Black background with Teal border
  card: "bg-black border-2 border-[#008080]/30 shadow-[0_0_20px_rgba(0,128,128,0.05)] p-6 mb-6 relative group overflow-hidden transition-all duration-300 hover:border-[#00ffff]",
  
  // Custom Action Buttons using Cyan & Teal
  actionBtn: "bg-black border border-[#00ffff]/50 text-[#00ffff] hover:bg-[#00ffff] hover:text-black px-4 py-2 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 transition-all duration-300",

  // Navigation Hub using the requested colors
  navCard: "relative cursor-pointer group p-8 border border-white/5 bg-[#0a0a0a] hover:bg-white/5 transition-all duration-500 flex flex-col items-center justify-center gap-4 overflow-hidden",

  // Tactical Table
  tableHeader: "bg-black text-[#00ffff] uppercase text-[10px] font-black tracking-[0.2em] py-4 px-4 text-left border-b-2 border-[#008080]",
  td: "py-4 px-4 text-[11px] font-mono text-slate-400 border-b border-white/5 group-hover:text-white transition-colors",
};

const AdminDashboard = () => {
  const [panel, setPanel] = useState("main");
  const [users, setUsers] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chartMode, setChartMode] = useState("daily");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [uRes, pRes] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/all`),
        fetch(`${API_BASE_URL}/products/count`)
      ]);
      const uData = await uRes.json();
      const pData = await pRes.json();
      setUsers(uData);
      setUserCount(uData.length);
      setProductCount(pData.total || 0);
    } catch (err) {
      console.error("System Override Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const validStatus = ["placed", "success", "completed"];

  const analytics = useMemo(() => {
    let rev = 0, ords = 0, items = 0;
    users.forEach(u => {
      (u.orders || []).forEach(o => {
        ords++;
        if (validStatus.includes(o.status?.toLowerCase())) {
          rev += Number(o.total || 0);
          (o.items || []).forEach(i => items += Number(i.quantity || 0));
        }
      });
    });
    return { rev, ords, items };
  }, [users]);

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-[#00ffff] selection:text-black">
      
      {/* SCANLINE EFFECT */}
      <div className="fixed inset-0 pointer-events-none z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />

      {/* HEADER */}
      <nav className="sticky top-0 z-[70] bg-black border-b border-[#008080]/50 px-6 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FaTerminal className="text-[#00ffff] text-2xl animate-pulse" />
            <div>
              <h1 className="text-xl font-black tracking-tighter text-[#00ffff]">NEO_SYSTEM</h1>
              <div className="h-1 w-full bg-[#008080]/20"><div className="h-full bg-[#00ffff] w-1/3 animate-ping" /></div>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchDashboardData} className={styles.actionBtn}>
              <FaSync className={loading ? "animate-spin" : ""} /> Re_Sync
            </button>
            <NavLink to="/" className={styles.actionBtn}>
              <FaHome /> Exit_Void
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <AnimatePresence mode="wait">
          {panel === "main" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {/* METRICS GRID - Using Full Color Palette */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                {[
                  { label: "Revenue", val: analytics.rev, color: "text-[#00ffff]", pre: "₹" }, // Cyan
                  { label: "Orders", val: analytics.ords, color: "text-[#ff66b2]" },         // Rosepink
                  { label: "Items", val: analytics.items, color: "text-[#00ff00]" },         // Green
                  { label: "Stocks", val: productCount, color: "text-[#ff8c00]" },           // Orange
                  { label: "Nodes", val: userCount, color: "text-[#008080]" }               // Teal
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0a0a0a] border-l-4 border-current p-5 shadow-lg group">
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{stat.label}</p>
                    <h2 className={`text-3xl font-black italic tracking-tighter ${stat.color}`}>
                      {stat.pre}<CountUp end={stat.val} duration={2} separator="," />
                    </h2>
                  </div>
                ))}
              </div>

              {/* NAV HUB */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { id: "products", icon: <FaBox />, label: "Inventory", color: "#00ffff" },
                  { id: "tshirts", icon: <FaTshirt />, label: "Apparel", color: "#ff66b2" },
                  { id: "books", icon: <FaBook />, label: "Library", color: "#00ff00" },
                  { id: "blogs", icon: <FaNewspaper />, label: "Intel", color: "#ff8c00" },
                  { id: "orders", icon: <FaShoppingBag />, label: "Logistics", color: "#008080" },
                  { id: "analytics", icon: <FaChartLine />, label: "Data", color: "#ffffff" },
                ].map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ backgroundColor: item.color, color: "#000" }}
                    onClick={() => setPanel(item.id)}
                    className={styles.navCard}
                    style={{ borderBottom: `2px solid ${item.color}` }}
                  >
                    <div className="text-2xl mb-2" style={{ color: "inherit" }}>{item.icon}</div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ANALYTICS PANEL */}
          {panel === "analytics" && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={styles.card}>
              <div className="flex justify-between items-center mb-10">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> Back</button>
                <div className="flex bg-black border border-[#008080]">
                  <button onClick={() => setChartMode("daily")} className={`px-4 py-2 text-[10px] ${chartMode === 'daily' ? 'bg-[#00ffff] text-black' : 'text-white'}`}>Daily</button>
                  <button onClick={() => setChartMode("monthly")} className={`px-4 py-2 text-[10px] ${chartMode === 'monthly' ? 'bg-[#00ffff] text-black' : 'text-white'}`}>Monthly</button>
                </div>
              </div>

              <div className="h-[350px] w-full mb-10">
                <ResponsiveContainer>
                  <AreaChart data={users.flatMap(u => u.orders || [])}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ff66b2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="createdAt" hide />
                    <YAxis tick={{fill: '#008080', fontSize: 10}} />
                    <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #00ffff'}} />
                    <Area type="monotone" dataKey="total" stroke="#00ffff" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 border border-[#ff66b2]/20 bg-[#0a0a0a]">
                  <h3 className="text-[#ff66b2] text-[10px] font-black uppercase mb-4 tracking-widest">System_Alerts</h3>
                  <div className="flex items-center gap-4 text-xs text-[#00ff00]">
                    <FaGhost className="animate-bounce" />
                    <span>Mainframe online. All encryption protocols active.</span>
                  </div>
                </div>
                <div className="p-6 border border-[#ff8c00]/20 bg-[#0a0a0a]">
                  <h3 className="text-[#ff8c00] text-[10px] font-black uppercase mb-4 tracking-widest">Network_Stats</h3>
                  <div className="w-full bg-white/5 h-2"><div className="bg-[#00ffff] h-full w-[85%]" /></div>
                  <p className="text-[9px] mt-2 text-slate-500">BANDWIDTH_USAGE: 85%</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SHARED EDITOR VIEW */}
          {["products", "tshirts", "books", "blogs", "orders"].includes(panel) && (
            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={styles.card}>
              <div className="flex justify-between items-center mb-8 border-b border-[#008080]/30 pb-4">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> Terminate</button>
                <span className="text-[#ff66b2] font-black text-[10px] tracking-widest uppercase">Uplink::{panel}</span>
              </div>
              <div className="bg-black p-4">
                {panel === "products" && <AdminProductsAdd />}
                {panel === "tshirts" && <AdminTShirtsAdd />}
                {panel === "books" && <AdminBookAdd />}
                {panel === "blogs" && <AdminBlogAdd />}
                {panel === "orders" && (
                   <div className="text-[#00ff00] text-xs font-mono">
                     {/* Simplified table for brief view */}
                     <p>Accessing encrypted transaction logs...</p>
                     <div className="mt-4 border border-[#00ff00]/20 p-2">
                       {users.flatMap(u => u.orders || []).slice(0,10).map((o, idx) => (
                         <div key={idx} className="flex justify-between py-1 border-b border-white/5">
                           <span>{o._id}</span>
                           <span className="text-[#ff8c00]">₹{o.total}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-10 flex justify-between items-center text-[9px] text-slate-700 font-bold uppercase tracking-[0.4em]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse" />
          <span>Sync_Active</span>
        </div>
        <span>© 2026 TechKart_Industrial</span>
        <div className="flex gap-4">
          <span className="text-[#ff66b2]">Rose</span>
          <span className="text-[#00ffff]">Cyan</span>
          <span className="text-[#ff8c00]">Orange</span>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;