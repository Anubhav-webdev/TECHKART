import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import CountUp from "react-countup";
import { API_BASE_URL } from "../config/apiConfig";
import {
  FaBox, FaTshirt, FaBook, FaNewspaper, FaArrowLeft,
  FaHome, FaSync, FaChartLine, FaShoppingBag, FaGhost, FaShieldAlt
} from "react-icons/fa";

import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from "recharts";

// Sub modules (Assumed existing)
import AdminBlogAdd from "./AdminBlogAdd";
import AdminTShirtsAdd from "./AdminTshirtsAdd";
import AdminProductsAdd from "./AdminProductsAdd";
import AdminBookAdd from "./AdminBookAdd";

// ================= THEMED STYLES =================
const styles = {
  // Enhanced Cyber Card with scanning line animation
  card: "bg-[#0a0f1a]/80 backdrop-blur-md border border-cyan-500/20 rounded-br-3xl rounded-tl-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden mb-6 group transition-all duration-500 hover:border-cyan-500/50",

  // High-contrast Action Buttons
  actionBtn: "bg-transparent hover:bg-cyan-500 hover:text-black border border-cyan-500/50 text-cyan-400 px-5 py-2 rounded-none skew-x-[-12deg] transition-all duration-300 font-bold uppercase tracking-widest flex items-center gap-2 text-xs active:scale-95",

  // Grid Navigation Modules
  navCard: "relative cursor-pointer group p-6 border border-slate-800 bg-slate-900/30 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-500 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center",

  // Tactical Table
  tableHeader: "text-cyan-600 uppercase text-[9px] font-black tracking-[0.3em] py-4 px-4 text-left border-b border-cyan-500/10",
  tableRow: "border-b border-white/5 hover:bg-cyan-500/5 transition-colors group",
  td: "py-4 px-4 text-xs font-medium text-slate-400 group-hover:text-white transition-colors",
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// ================= MAIN COMPONENT =================
const AdminDashboard = () => {
  const [panel, setPanel] = useState("main");
  const [users, setUsers] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chartMode, setChartMode] = useState("daily");

  const fetchDashboardData = async () => {
    console.log("Fetching dashboard data...");
    try {
      setLoading(true);
      const usersRes = await fetch(`${API_BASE_URL}/auth/all`);
      const usersData = await usersRes.json();
      setUserCount(usersData.length);
      setUsers(usersData);

      const productRes = await fetch(`${API_BASE_URL}/products/count`);
      const productData = await productRes.json();
      setProductCount(productData.total || 0);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const analytics = useMemo(() => {
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalItemsSold = 0;

    users.forEach(user => {
      (user.orders || []).forEach(order => {
        totalOrders++;
        if (
   order.status?.toLowerCase() === "placed" ||
   order.status?.toLowerCase() === "success" ||
   order.status?.toLowerCase() === "completed"
) {
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
    const status = order.status?.toLowerCase();

if (
   status !== "placed" ||
   status !== "success" ||
   status !== "completed"
) return;
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
     const status = order.status?.toLowerCase();

if (
   status !== "placed" &&
   status !== "success" &&
   status !== "completed"
) return;
        (order.items || []).forEach(item => {
          if (!map[item.product]) map[item.product] = { qty: 0, revenue: 0 };
          map[item.product].qty += item.quantity;
          map[item.product].revenue += item.quantity * item.price;
        });
      });
    });
    return Object.entries(map).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.revenue - a.revenue);
  }, [users]);
  // ================= MONTHLY STATS =================
  const monthlyStats = useMemo(() => {
    const map = {};

    users.forEach(user => {
      (user.orders || []).forEach(order => {
  const status = order.status?.toLowerCase();

if (
   status !== "placed" &&
   status !== "success" &&
   status !== "completed"
) return;
        const d = new Date(order.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

        if (!map[key]) {
          map[key] = { revenue: 0, orders: 0 };
        }

        map[key].revenue += Number(order.total || 0);
        map[key].orders += 1;
      });
    });

    const months = Object.entries(map).map(([month, data]) => ({
      month,
      ...data,
    }));

    if (months.length === 0) {
      return {
        highest: 0,
        lowest: 0,
        latency: "0%",
        progress: "0%",
      };
    }

    const highest = Math.max(...months.map(m => m.revenue));
    const lowest = Math.min(...months.map(m => m.revenue));

    const avg = months.reduce((a, b) => a + b.revenue, 0) / months.length;
    const progress = avg ? ((highest - lowest) / avg) * 100 : 0;

    return {
      highest,
      lowest,
      latency: `${months.length} cycles`,
      progress: `${progress.toFixed(1)}%`,
    };
  }, [users]);

  return (
    <div className="min-h-screen bg-[#020406] text-orange-600 font-mono selection:bg-cyan-500/30 overflow-x-hidden font-bold">

      {/* SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-[60] bg-[#020406]/90 backdrop-blur-xl border-b border-cyan-500/10 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <FaShieldAlt className="text-3xl text-cyan-500 group-hover:rotate-12 transition-transform duration-500" />
              <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <div>
              <h1 className="text-xl font-black italic tracking-[-0.05em] text-white">NEO-PHOENIX<span className="text-cyan-500">.SYS</span></h1>
              <div className="h-[2px] w-32 bg-slate-800 mt-1 relative overflow-hidden">
                <motion.div
                  animate={{ x: [-128, 128] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 bg-cyan-500 w-1/2"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={fetchDashboardData} className={styles.actionBtn}>
              <FaSync className={loading ? "animate-spin" : ""} /> RE_SYNC
            </button>
            <NavLink to="/" className={styles.actionBtn}>
              <FaHome /> EXIT_VOID
            </NavLink>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto p-8 relative z-10">
        <AnimatePresence mode="wait">

          {/* MAIN DASHBOARD */}
          {panel === "main" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 uppercase">
                {[
                  { label: "totalRevenue", val: analytics.totalRevenue, color: "text-cyan-500", prefix: "₹" },
                  { label: "totalOrders", val: analytics.totalOrders, color: "text-pink-700" },
                  { label: "totalItemsSold", val: analytics.totalItemsSold, color: "text-blue-400" },
                  { label: "TOTAL STOCKS", val: productCount, color: "text-green-500" },
                  { label: "REGISTERED USER", val: userCount, color: "text-orange-500" }
                ].map((stat, i) => (
                  <motion.div key={i} variants={itemVariants} className={styles.card}>
                    <div className="absolute top-0 right-0 p-3 opacity-10 text-[10px] font-black">NODE_0{i + 1}</div>
                    <p className="text-[10px] uppercase tracking-widest text-cyan-600/70 font-bold mb-2">{stat.label}</p>
                    <h2 className={`text-3xl font-black tracking-tighter ${stat.color}`}>
                      {stat.prefix}<CountUp end={stat.val} separator="," duration={2.5} />
                    </h2>
                    <div className="mt-4 flex gap-1 h-1">
                      <div className="flex-1 bg-cyan-500/40 animate-pulse" />
                      <div className="flex-1 bg-white/40 animate-pulse" />
                      <div className="flex-1 bg-red-600/40 animate-pulse" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 uppercase">
                {[
                  { id: "products", icon: <FaBox />, label: "Products" },
                  { id: "tshirts", icon: <FaTshirt />, label: "T-Shirts" },
                  { id: "books", icon: <FaBook />, label: "Books" },
                  { id: "blogs", icon: <FaNewspaper />, label: "Blogs" },
                  { id: "orders", icon: <FaShoppingBag />, label: "Orders" },
                  { id: "analytics", icon: <FaChartLine />, label: "Analytics" },
                ].map((item, idx) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => setPanel(item.id)}
                    className={styles.navCard}
                  >
                    <div className="text-3xl mb-4 text-cyan-500 group-hover:text-white transition-colors drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">{item.icon}</div>
                    <p className="text-[11px] font-black tracking-[0.2em] group-hover:text-cyan-400 transition-colors">{item.label}</p>
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/20 rounded-xl transition-all" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ORDERS LOGS */}
          {panel === "orders" && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={styles.card}>
              <div className="flex justify-between items-center mb-8 border-b border-cyan-500/10 pb-6">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> ESC_BACK</button>
                <h2 className="text-sm font-black tracking-[0.4em] text-cyan-500">TRANSACTION_PROTOCOL</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>Uplink_Identity</th>
                      <th className={styles.tableHeader}>Credits</th>
                      <th className={styles.tableHeader}>Status_Bit</th>
                      <th className={styles.tableHeader}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map(o => (
                      <tr key={o._id} className={styles.tableRow}>
                        <td className={styles.td}>{o.username}</td>
                        <td className={`${styles.td} text-cyan-400 font-bold`}>₹{o.total}</td>
                        <td className={styles.td}>
                          <span className={`px-3 py-1 text-[9px] font-black tracking-widest ${o.status === 'placed' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                         {(o.status || "pending").toUpperCase()}
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
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.card}>
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> ESC_BACK</button>
                <div className="flex gap-2 p-1 bg-slate-900 rounded-lg">
                  <button onClick={() => setChartMode("daily")} className={`px-4 py-1.5 text-[10px] font-bold transition-all ${chartMode === 'daily' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-white'}`}>Daily</button>
                  <button onClick={() => setChartMode("monthly")} className={`px-4 py-1.5 text-[10px] font-bold transition-all ${chartMode === 'monthly' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-white'}`}>Monthly</button>
                </div>
              </div>

              <div className="h-[350px] w-full min-w-0 mt-4">
                <ResponsiveContainer>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: 'orange', fontSize: 10 }} axisLine={false} />
                    <YAxis tick={{ fill: 'red', fontSize: 10 }} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid #06b6d433', color: '#06b6d4', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-12 grid md:grid-cols-2 gap-8 border-t border-cyan-500/10 pt-8">
                <div>
                  <h3 className="text-cyan-500 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">High_Priority_Targets</h3>
                  <div className="space-y-3">
                    {productRanking.slice(0, 7).map(p => (
                      <div key={p.id} className="flex justify-between items-center py-3 px-4 bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 transition-colors rounded-lg">
                        <span className="text-[10px] text-slate-400 font-bold truncate max-w-[140px]">{p.id}</span>
                        <span className="text-xs text-cyan-400 font-black">₹{p.revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-cyan-500/5 p-8 flex flex-col justify-center items-center border border-cyan-500/10 rounded-2xl relative group">
                  <FaGhost className="text-6xl text-cyan-500 mb-4 opacity-20 animate-bounce group-hover:opacity-100 transition-opacity " />

                  <p className="text-[11px] text-cyan-400 font-black tracking-[0.2em]">
                    MAX_PEAK_REVENUE: ₹{monthlyStats.highest.toLocaleString()}
                  </p>

                  <p className="text-[11px] text-cyan-400 font-black tracking-[0.2em]">
                    MIN_FLOOR_REVENUE: ₹{monthlyStats.lowest.toLocaleString()}
                  </p>

                  <p className="text-[11px] text-cyan-400 font-black tracking-[0.2em]">
                    Latency: {monthlyStats.latency}
                  </p>

                  <p className="text-[11px] text-cyan-400 font-black tracking-[0.2em]">
                    Progress Rate: {monthlyStats.progress}
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {/* EDITOR PANELS */}
          {["products", "tshirts", "books", "blogs"].includes(panel) && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={styles.card}>
              <div className="flex justify-between items-center mb-8 border-b border-cyan-500/10 pb-6">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> TERMINATE</button>
                <div className="flex flex-col items-end">
                  <span className="text-cyan-500 font-black tracking-[0.3em] uppercase text-xs">UPLINK_EDITOR::{panel}</span>
                  <span className="text-[8px] text-slate-600 font-bold mt-1 tracking-widest">ENCRYPTION_ACTIVE</span>
                </div>
              </div>
              <div className="bg-black/60 p-8 border border-cyan-500/10 rounded-xl shadow-inner">
                {panel === "products" && <AdminProductsAdd />}
                {panel === "tshirts" && <AdminTShirtsAdd />}
                {panel === "books" && <AdminBookAdd />}
                {panel === "blogs" && <AdminBlogAdd />}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER TICKER */}
      <footer className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center text-[12px] text-cyan-600 font-black uppercase tracking-widest opacity-50 ">
        <span>System: Neo-Phoenix</span>
        <span className="animate-pulse">Status: Syncing with Mainframe...</span>
        <span>TechKart 2025</span>
      </footer>
    </div>
  );
};

export default AdminDashboard;