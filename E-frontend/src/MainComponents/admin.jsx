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

// ================= NEW TACTICAL BRUTALIST STYLES =================
const styles = {
  // Sharp, industrial container with a "thick" bottom border
  card: "bg-[#0d1117] border-2 border-[#30363d] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-6 relative group overflow-hidden transition-all duration-300 hover:border-orange-500",
  
  // Tactical Header button
  actionBtn: "bg-[#161b22] border-2 border-[#30363d] hover:border-orange-500 text-slate-300 hover:text-orange-500 px-4 py-2 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",

  // Metric Boxes
  metricBox: "relative p-5 border-l-4 border-orange-600 bg-[#161b22]/50 shadow-inner overflow-hidden",

  // Nav Grid Cards
  navCard: "relative cursor-pointer group p-8 border-2 border-[#30363d] bg-[#0d1117] hover:bg-orange-600/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",

  // Table Styles
  tableHeader: "bg-[#161b22] text-orange-500 uppercase text-[10px] font-black tracking-[0.2em] py-4 px-4 text-left border-2 border-[#30363d]",
  td: "py-4 px-4 text-[11px] font-mono text-slate-400 border-b border-[#30363d] group-hover:text-white transition-colors",
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
      const [usersRes, productRes] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/all`),
        fetch(`${API_BASE_URL}/products/count`)
      ]);
      
      const usersData = await usersRes.json();
      const productData = await productRes.json();
      
      setUsers(usersData);
      setUserCount(usersData.length);
      setProductCount(productData.total || 0);
    } catch (err) {
      console.error("Critical System Failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter Logic Helper
  const validStatus = ["placed", "success", "completed"];

  const analytics = useMemo(() => {
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalItemsSold = 0;

    users.forEach(user => {
      (user.orders || []).forEach(order => {
        totalOrders++;
        if (validStatus.includes(order.status?.toLowerCase())) {
          totalRevenue += Number(order.total || 0);
          (order.items || []).forEach(item => {
            totalItemsSold += Number(item.quantity || 0);
          });
        }
      });
    });
    return { totalOrders, totalRevenue, totalItemsSold };
  }, [users]);

  const allOrders = useMemo(() =>
    users.flatMap(u => (u.orders || []).map(o => ({ ...o, username: u.username }))),
    [users]
  );

  const revenueData = useMemo(() => {
    const map = {};
    users.forEach(user => {
      (user.orders || []).forEach(order => {
        if (!validStatus.includes(order.status?.toLowerCase())) return;
        const d = new Date(order.createdAt);
        const key = chartMode === "daily" ? d.toISOString().slice(0, 10) : `${d.getFullYear()}-${d.getMonth() + 1}`;
        map[key] = (map[key] || 0) + Number(order.total || 0);
      });
    });
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
  }, [users, chartMode]);

  const productRanking = useMemo(() => {
    const map = {};
    users.forEach(user => {
      (user.orders || []).forEach(order => {
        if (!validStatus.includes(order.status?.toLowerCase())) return;
        (order.items || []).forEach(item => {
          if (!map[item.product]) map[item.product] = { qty: 0, revenue: 0 };
          map[item.product].qty += item.quantity;
          map[item.product].revenue += item.quantity * item.price;
        });
      });
    });
    return Object.entries(map).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.revenue - a.revenue);
  }, [users]);

  const monthlyStats = useMemo(() => {
    const map = {};
    users.forEach(user => {
      (user.orders || []).forEach(order => {
        if (!validStatus.includes(order.status?.toLowerCase())) return;
        const d = new Date(order.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        if (!map[key]) map[key] = { revenue: 0, count: 0 };
        map[key].revenue += Number(order.total || 0);
        map[key].count++;
      });
    });
    const revs = Object.values(map).map(m => m.revenue);
    return {
      highest: Math.max(...revs, 0),
      lowest: Math.min(...revs, 0),
      count: Object.keys(map).length
    };
  }, [users]);

  return (
    <div className="min-h-screen bg-[#010409] text-slate-300 font-mono selection:bg-orange-500 selection:text-black">
      
      {/* GLOBAL HUD OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-[100] border-[16px] border-[#0d1117] opacity-20" />

      {/* NAVIGATION BAR */}
      <nav className="sticky top-0 z-[70] bg-[#0d1117] border-b-2 border-[#30363d] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              <FaTerminal className="text-black text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white uppercase">Phoenix_Command</h1>
              <p className="text-[9px] text-orange-500 font-bold tracking-[0.3em]">SECURE_ADMIN_V4.0</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={fetchDashboardData} className={styles.actionBtn}>
              <FaSync className={loading ? "animate-spin" : ""} /> Sync_Data
            </button>
            <NavLink to="/" className={styles.actionBtn}>
              <FaHome /> Disconnect
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12 relative">
        <AnimatePresence mode="wait">
          {panel === "main" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {/* METRICS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                {[
                  { label: "Revenue", val: analytics.totalRevenue, color: "text-white", pre: "₹" },
                  { label: "Orders", val: analytics.totalOrders, color: "text-orange-500" },
                  { label: "Units_Sold", val: analytics.totalItemsSold, color: "text-slate-200" },
                  { label: "Inventory", val: productCount, color: "text-slate-200" },
                  { label: "Users", val: userCount, color: "text-slate-200" }
                ].map((stat, i) => (
                  <div key={i} className={styles.metricBox}>
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-2">{stat.label}</p>
                    <h2 className={`text-3xl font-black italic tracking-tighter ${stat.color}`}>
                      {stat.pre}<CountUp end={stat.val} duration={2} separator="," />
                    </h2>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 rotate-45 translate-x-4 -translate-y-4" />
                  </div>
                ))}
              </div>

              {/* NAVIGATION HUB */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { id: "products", icon: <FaBox />, label: "Inventory" },
                  { id: "tshirts", icon: <FaTshirt />, label: "Apparel" },
                  { id: "books", icon: <FaBook />, label: "Archives" },
                  { id: "blogs", icon: <FaNewspaper />, label: "Broadcast" },
                  { id: "orders", icon: <FaShoppingBag />, label: "Logistics" },
                  { id: "analytics", icon: <FaChartLine />, label: "Intel" },
                ].map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPanel(item.id)}
                    className={styles.navCard}
                  >
                    <div className="text-2xl text-orange-500">{item.icon}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ORDERS LOGS */}
          {panel === "orders" && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={styles.card}>
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> Back</button>
                <h2 className="text-xs font-black tracking-[0.4em] text-orange-500">MANIFEST_LOGS</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>User_ID</th>
                      <th className={styles.tableHeader}>Credits</th>
                      <th className={styles.tableHeader}>Status</th>
                      <th className={styles.tableHeader}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map(o => (
                      <tr key={o._id} className="group hover:bg-orange-500/5 transition-colors">
                        <td className={styles.td}>{o.username}</td>
                        <td className={`${styles.td} text-white font-bold`}>₹{o.total}</td>
                        <td className={styles.td}>
                          <span className={`px-2 py-1 text-[9px] font-black uppercase border ${validStatus.includes(o.status) ? 'border-green-900 text-green-500 bg-green-500/5' : 'border-red-900 text-red-500 bg-red-500/5'}`}>
                            {o.status || "UNKNOWN"}
                          </span>
                        </td>
                        <td className={styles.td}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ANALYTICS VISUALIZER */}
          {panel === "analytics" && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={styles.card}>
              <div className="flex justify-between items-center mb-10">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> Exit_Intel</button>
                <div className="flex border-2 border-[#30363d]">
                  <button onClick={() => setChartMode("daily")} className={`px-4 py-2 text-[10px] font-bold ${chartMode === 'daily' ? 'bg-orange-600 text-black' : 'bg-transparent'}`}>Daily</button>
                  <button onClick={() => setChartMode("monthly")} className={`px-4 py-2 text-[10px] font-bold ${chartMode === 'monthly' ? 'bg-orange-600 text-black' : 'bg-transparent'}`}>Monthly</button>
                </div>
              </div>

              <div className="h-[400px] w-full mb-12">
                <ResponsiveContainer>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#484f58', fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: '#484f58', fontSize: 10 }} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '2px solid #30363d', borderRadius: '0px' }} />
                    <Area type="stepAfter" dataKey="revenue" stroke="#ea6045" strokeWidth={3} fill="#ea6045" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <h3 className="text-orange-500 text-[10px] font-black mb-6 uppercase tracking-widest border-b-2 border-orange-500 pb-2 inline-block">High_Value_Assets</h3>
                  <div className="space-y-2">
                    {productRanking.slice(0, 5).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-4 bg-[#161b22] border border-[#30363d]">
                        <span className="text-[10px] font-bold truncate max-w-[200px]">{p.id}</span>
                        <span className="text-xs text-white font-black">₹{p.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-orange-600/5 p-8 border-2 border-dashed border-orange-500/20 flex flex-col justify-center">
                  <FaGhost className="text-4xl text-orange-500 mb-6 opacity-40" />
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Peak_Rev</span>
                      <span className="text-sm font-black text-white">₹{monthlyStats.highest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Floor_Rev</span>
                      <span className="text-sm font-black text-white">₹{monthlyStats.lowest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Active_Cycles</span>
                      <span className="text-sm font-black text-white">{monthlyStats.count} Units</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* EDITOR PANELS */}
          {["products", "tshirts", "books", "blogs"].includes(panel) && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={styles.card}>
              <div className="flex justify-between items-center mb-8 border-b-2 border-[#30363d] pb-6">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> Abort</button>
                <div className="text-right">
                  <span className="text-orange-500 font-black tracking-widest uppercase text-xs">Editor::{panel}</span>
                </div>
              </div>
              <div className="bg-black/20 p-6 border border-[#30363d]">
                {panel === "products" && <AdminProductsAdd />}
                {panel === "tshirts" && <AdminTShirtsAdd />}
                {panel === "books" && <AdminBookAdd />}
                {panel === "blogs" && <AdminBlogAdd />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-bold uppercase tracking-[0.5em]">
        <span>// NEOPHOENIX_CORE_OS</span>
        <span className="text-orange-900 animate-pulse">Uplink Stable - 99.9%</span>
        <span>© 2026 TechKart Industrial</span>
      </footer>
    </div>
  );
};

export default AdminDashboard;