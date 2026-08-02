import React, { useEffect, useState, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import CountUp from "react-countup";
import { API_BASE_URL } from "../config/apiConfig";
import {
  FaBox, FaTshirt, FaBook, FaNewspaper, FaArrowLeft,
  FaHome, FaSync, FaChartLine, FaShoppingBag, FaGhost, FaShieldAlt,
  FaCommentDots, FaExclamationTriangle, FaUsers, FaClock,
  FaHeart, FaCheckCircle
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
  card: "bg-[#0a0f1a]/80 backdrop-blur-md border border-cyan-500/20 rounded-br-3xl rounded-tl-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden mb-6 group transition-all duration-500 hover:border-cyan-500/50",
  actionBtn: "bg-transparent hover:bg-cyan-500 hover:text-black border border-cyan-500/50 text-cyan-400 px-5 py-2 rounded-none skew-x-[-12deg] transition-all duration-300 font-bold uppercase tracking-widest flex items-center gap-2 text-xs active:scale-95",
  navCard: "relative cursor-pointer group p-6 border border-slate-800 bg-slate-900/30 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-500 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center",
  tableHeader: "text-cyan-600 uppercase text-[10px] font-black tracking-[0.2em] py-4 px-4 text-left border-b border-cyan-500/10",
  tableRow: "border-b border-white/5 hover:bg-cyan-500/5 transition-colors group",
  td: "py-4 px-4 text-xs font-medium text-slate-300 group-hover:text-white transition-colors",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const validStatuses = ["placed", "success", "completed"];

const AdminDashboard = () => {
  const [panel, setPanel] = useState("main");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [visits, setVisits] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chartMode, setChartMode] = useState("daily");
  const [activityFilter, setActivityFilter] = useState("all");
  const [activitySearch, setActivitySearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserHistory, setSelectedUserHistory] = useState([]);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);

  const formatDuration = (seconds = 0) => {
    if (!seconds) return "0s";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs) return `${hrs}h ${mins}m ${secs}s`;
    if (mins) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setFeedbackLoading(true);
      setActivityLoading(true);
      const [usersRes, productsRes, productRes, feedbackRes, visitsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/all`),
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/products/count`),
        fetch(`${API_BASE_URL}/feedback`),
        fetch(`${API_BASE_URL}/visits/history?limit=200`)
      ]);
      
      const usersData = await usersRes.json();
      const productsData = productsRes.ok ? await productsRes.json() : [];
      const productData = await productRes.json();
      const feedbackData = feedbackRes.ok ? await feedbackRes.json() : { feedbacks: [] };
      const visitsData = visitsRes.ok ? await visitsRes.json() : { visits: [] };

      setUsers(usersData);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setUserCount(usersData.length);
      setProductCount(productData.total || 0);
      setFeedbacks(feedbackData.feedbacks || []);
      setVisits(visitsData.visits || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      setFeedbackLoading(false);
      setActivityLoading(false);
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
        if (validStatuses.includes(order.status?.toLowerCase())) {
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
        if (!validStatuses.includes(order.status?.toLowerCase())) return;
        
        const d = new Date(order.createdAt);
        const key = chartMode === "daily" 
          ? d.toISOString().slice(0, 10) 
          : `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        
        map[key] = (map[key] || 0) + Number(order.total || 0);
      });
    });
    return Object.entries(map)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [users, chartMode]);

  const productRanking = useMemo(() => {
    const map = {};
    users.forEach(user => {
      (user.orders || []).forEach(order => {
        if (!validStatuses.includes(order.status?.toLowerCase())) return;
        (order.items || []).forEach(item => {
          if (!map[item.product]) map[item.product] = { qty: 0, revenue: 0 };
          map[item.product].qty += (item.quantity || 0);
          map[item.product].revenue += (item.quantity || 0) * (item.price || 0);
        });
      });
    });
    return Object.entries(map)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [users]);

  const userRoleMap = useMemo(() => {
    return users.reduce((acc, user) => {
      const key = String(user._id || user.id || "");
      if (key) acc[key] = user.role || "user";
      return acc;
    }, {});
  }, [users]);

  const lowStockItems = useMemo(() => {
    return products
      .filter((item) => Number(item.stock || 0) <= 5)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
      .slice(0, 6);
  }, [products]);

  const wishlistStats = useMemo(() => {
    const totalWishlistItems = users.reduce((sum, user) => sum + (Array.isArray(user.wishlist) ? user.wishlist.length : 0), 0);
    const activeWishlistUsers = users.filter((user) => Array.isArray(user.wishlist) && user.wishlist.length > 0).length;
    return {
      totalWishlistItems,
      activeWishlistUsers,
      averageWishlistItems: activeWishlistUsers ? (totalWishlistItems / activeWishlistUsers).toFixed(1) : 0,
    };
  }, [users]);

  const cartStats = useMemo(() => {
    const totalCartItems = users.reduce((sum, user) => {
      const items = Array.isArray(user.cart) ? user.cart : [];
      return sum + items.reduce((itemSum, entry) => itemSum + Number(entry.quantity || 1), 0);
    }, 0);
    const activeCartUsers = users.filter((user) => Array.isArray(user.cart) && user.cart.length > 0).length;
    return {
      totalCartItems,
      activeCartUsers,
      averageCartItems: activeCartUsers ? (totalCartItems / activeCartUsers).toFixed(1) : 0,
    };
  }, [users]);

  const recentOrders = useMemo(() => {
    return allOrders
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [allOrders]);

  const topCustomers = useMemo(() => {
    const totals = {};

    users.forEach((user) => {
      const revenue = (user.orders || [])
        .filter((order) => validStatuses.includes(order.status?.toLowerCase()))
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      if (revenue > 0) {
        totals[user.username || user.email || user._id] = revenue;
      }
    });

    return Object.entries(totals)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [users]);

  const feedbackStats = useMemo(() => {
    const stats = { pending: 0, reviewed: 0, resolved: 0 };
    feedbacks.forEach((item) => {
      const status = item.status || "pending";
      if (stats[status] !== undefined) stats[status] += 1;
    });
    return stats;
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    if (feedbackFilter === "all") return feedbacks;
    return feedbacks.filter((item) => (item.status || "pending") === feedbackFilter);
  }, [feedbacks, feedbackFilter]);

  const activitySummary = useMemo(() => {
    const grouped = {};

    visits.forEach((visit) => {
      const key = visit.userId || "guest";
      if (!grouped[key]) {
        grouped[key] = {
          userId: visit.userId || "guest",
          username: visit.username || "Guest",
          totalDurationSeconds: 0,
          pagesVisited: 0,
          lastVisit: visit.visitedAt,
          lastPage: visit.page || "/",
          location: visit.location || "Unknown",
          locationSource: visit.locationSource || "unavailable",
        };
      }

      grouped[key].totalDurationSeconds += Number(visit.durationSeconds || 0);
      grouped[key].pagesVisited += 1;
      if (new Date(visit.visitedAt) > new Date(grouped[key].lastVisit)) {
        grouped[key].lastVisit = visit.visitedAt;
        grouped[key].lastPage = visit.page || "/";
        grouped[key].location = visit.location || "Unknown";
        grouped[key].locationSource = visit.locationSource || "unavailable";
      }
    });

    return Object.values(grouped).sort((a, b) => new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0));
  }, [visits]);

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Delete this feedback permanently?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete feedback");

      setFeedbacks((prev) => prev.filter((item) => item._id !== feedbackId));
    } catch (err) {
      console.error("Delete feedback error:", err);
      alert(err.message || "Unable to delete feedback");
    }
  };

  const handleFeedbackStatusChange = async (feedbackId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/${feedbackId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update feedback status");

      setFeedbacks((prev) => prev.map((item) => (item._id === feedbackId ? { ...item, status } : item)));
    } catch (err) {
      console.error("Feedback status update error:", err);
      alert(err.message || "Unable to update feedback status");
    }
  };

  const loadUserTimeline = async (userId) => {
    if (!userId) {
      setSelectedUserId("");
      setSelectedUserHistory([]);
      return;
    }

    setSelectedUserId(userId);
    setSelectedUserLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/visits/history?userId=${encodeURIComponent(userId)}&limit=200`);
      const data = await res.json();
      setSelectedUserHistory(data.visits || []);
    } catch (err) {
      console.error("Visit timeline error:", err);
      setSelectedUserHistory([]);
    } finally {
      setSelectedUserLoading(false);
    }
  };

  const filteredActivitySummary = useMemo(() => {
    const searchValue = activitySearch.trim().toLowerCase();

    return activitySummary.filter((item) => {
      const role = userRoleMap[String(item.userId || "")] || "user";
      const matchesFilter = activityFilter === "all"
        ? true
        : activityFilter === "admin"
          ? role === "admin"
          : role !== "admin";

      if (!matchesFilter) return false;
      if (!searchValue) return true;

      return [item.username, item.userId, item.lastPage, item.location]
        .some((value) => String(value || "").toLowerCase().includes(searchValue));
    });
  }, [activitySearch, activityFilter, activitySummary, userRoleMap]);

  const monthlyStats = useMemo(() => {
    const map = {};
    users.forEach(user => {
      (user.orders || []).forEach(order => {
        if (!validStatuses.includes(order.status?.toLowerCase())) return;
        const d = new Date(order.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        if (!map[key]) map[key] = { revenue: 0, orders: 0 };
        map[key].revenue += Number(order.total || 0);
        map[key].orders += 1;
      });
    });

    const months = Object.values(map);
    if (months.length === 0) return { highest: 0, lowest: 0, latency: "0 cycles", progress: "0%" };

    const revenues = months.map(m => m.revenue);
    const highest = Math.max(...revenues);
    const lowest = Math.min(...revenues);
    const avg = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    const progress = avg ? ((highest - lowest) / avg) * 100 : 0;

    return { highest, lowest, latency: `${months.length} cycles`, progress: `${progress.toFixed(1)}%` };
  }, [users]);

  return (
    <div className="min-h-screen bg-[#020406] text-slate-300 font-mono selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* SCANLINE & BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      <header className="sticky top-0 z-[60] bg-[#020406]/90 backdrop-blur-xl border-b border-cyan-500/10 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <FaShieldAlt className="text-3xl text-cyan-500" />
            <div>
              <h1 className="text-xl font-black italic tracking-tighter text-white">NEO-PHOENIX<span className="text-cyan-500">.SYS</span></h1>
              <div className="h-[2px] w-32 bg-slate-800 mt-1 relative overflow-hidden">
                <Motion.div animate={{ x: [-128, 128] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 bg-cyan-500 w-1/2" />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchDashboardData} className={styles.actionBtn}>
              <FaSync className={loading ? "animate-spin" : ""} /> RE_SYNC
            </button>
            <NavLink to="/" className={styles.actionBtn}><FaHome /> EXIT_VOID</NavLink>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 relative z-10">
        <AnimatePresence mode="wait">
          
          {panel === "main" && (
            <Motion.div variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: 20 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { label: "Revenue", val: analytics.totalRevenue, color: "text-cyan-400", prefix: "₹" },
                  { label: "Orders", val: analytics.totalOrders, color: "text-purple-400" },
                  { label: "Sold", val: analytics.totalItemsSold, color: "text-blue-400" },
                  { label: "Stock", val: productCount, color: "text-emerald-400" },
                  { label: "Users", val: userCount, color: "text-amber-400" }
                ].map((stat, i) => (
                  <Motion.div key={i} variants={itemVariants} className={styles.card}>
                    <p className="text-[10px] uppercase tracking-widest text-cyan-600/70 font-bold mb-2">{stat.label}</p>
                    <h2 className={`text-2xl font-black tracking-tighter ${stat.color}`}>
                      {stat.prefix}<CountUp end={stat.val} separator="," duration={2} />
                    </h2>
                  </Motion.div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                {[
                  { id: "products", icon: <FaBox />, label: "Products" },
                  { id: "tshirts", icon: <FaTshirt />, label: "T-Shirts" },
                  { id: "books", icon: <FaBook />, label: "Books" },
                  { id: "blogs", icon: <FaNewspaper />, label: "Blogs" },
                  { id: "orders", icon: <FaShoppingBag />, label: "Orders" },
                  { id: "feedback", icon: <FaCommentDots />, label: "Feedback" },
                  { id: "activity", icon: <FaGhost />, label: "Activity" },
                  { id: "analytics", icon: <FaChartLine />, label: "Analytics" },
                ].map((item) => (
                  <Motion.div key={item.id} variants={itemVariants} whileHover={{ y: -5 }} onClick={() => setPanel(item.id)} className={styles.navCard}>
                    <div className="text-2xl mb-3 text-cyan-500 group-hover:text-cyan-300 transition-colors">{item.icon}</div>
                    <p className="text-[10px] font-black tracking-widest uppercase">{item.label}</p>
                  </Motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-8">
                <div className={styles.card}>
                  <div className="flex items-center gap-3 mb-4">
                    <FaHeart className="text-pink-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">WISHLIST_ANALYTICS</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded border border-cyan-500/10 bg-slate-950/40 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Entries</p>
                      <p className="mt-2 text-xl font-bold text-pink-400">{wishlistStats.totalWishlistItems}</p>
                    </div>
                    <div className="rounded border border-cyan-500/10 bg-slate-950/40 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Users</p>
                      <p className="mt-2 text-xl font-bold text-cyan-400">{wishlistStats.activeWishlistUsers}</p>
                    </div>
                    <div className="rounded border border-cyan-500/10 bg-slate-950/40 p-3 col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Avg per active user</p>
                      <p className="mt-2 text-xl font-bold text-emerald-400">{wishlistStats.averageWishlistItems}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className="flex items-center gap-3 mb-4">
                    <FaShoppingBag className="text-cyan-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">CART_ANALYTICS</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded border border-cyan-500/10 bg-slate-950/40 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Items</p>
                      <p className="mt-2 text-xl font-bold text-cyan-400">{cartStats.totalCartItems}</p>
                    </div>
                    <div className="rounded border border-cyan-500/10 bg-slate-950/40 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Users</p>
                      <p className="mt-2 text-xl font-bold text-purple-400">{cartStats.activeCartUsers}</p>
                    </div>
                    <div className="rounded border border-cyan-500/10 bg-slate-950/40 p-3 col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Avg cart size</p>
                      <p className="mt-2 text-xl font-bold text-amber-400">{cartStats.averageCartItems}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-4 mt-8">
                <div className={styles.card}>
                  <div className="flex items-center gap-3 mb-4">
                    <FaExclamationTriangle className="text-amber-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">LOW_STOCK_ALERTS</h3>
                  </div>
                  <div className="space-y-3">
                    {lowStockItems.length ? lowStockItems.map((item) => (
                      <div key={item._id || item.id} className="flex items-center justify-between rounded border border-cyan-500/10 bg-slate-950/40 px-3 py-2 text-sm">
                        <span className="text-slate-300 truncate">{item.name || item.title || item.brand || "Unnamed item"}</span>
                        <span className="text-amber-400 font-bold">{item.stock || 0} left</span>
                      </div>
                    )) : <p className="text-sm text-slate-500">No stock issues at the moment.</p>}
                  </div>
                </div>

                <div className={styles.card}>
                  <div className="flex items-center gap-3 mb-4">
                    <FaUsers className="text-cyan-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">TOP_CUSTOMERS</h3>
                  </div>
                  <div className="space-y-3">
                    {topCustomers.length ? topCustomers.map((customer, idx) => (
                      <div key={customer.name + idx} className="flex items-center justify-between rounded border border-cyan-500/10 bg-slate-950/40 px-3 py-2 text-sm">
                        <span className="text-slate-300">{customer.name}</span>
                        <span className="text-cyan-400 font-bold">₹{customer.revenue.toLocaleString()}</span>
                      </div>
                    )) : <p className="text-sm text-slate-500">No completed orders yet.</p>}
                  </div>
                </div>

                <div className={styles.card}>
                  <div className="flex items-center gap-3 mb-4">
                    <FaClock className="text-purple-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">RECENT_ORDERS</h3>
                  </div>
                  <div className="space-y-3">
                    {recentOrders.length ? recentOrders.map((order) => (
                      <div key={`${order.username}-${order.createdAt}`} className="flex items-center justify-between rounded border border-cyan-500/10 bg-slate-950/40 px-3 py-2 text-sm">
                        <div>
                          <p className="text-slate-300">{order.username}</p>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500">{order.status}</p>
                        </div>
                        <span className="text-cyan-400 font-bold">₹{Number(order.total || 0).toLocaleString()}</span>
                      </div>
                    )) : <p className="text-sm text-slate-500">No orders recorded.</p>}
                  </div>
                </div>
              </div>
            </Motion.div>
          )}

          {panel === "orders" && (
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.card}>
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> BACK</button>
                <h2 className="text-xs font-black tracking-[0.3em] text-cyan-500 uppercase">Transaction_Logs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>User_ID</th>
                      <th className={styles.tableHeader}>Credits</th>
                      <th className={styles.tableHeader}>Status</th>
                      <th className={styles.tableHeader}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((o, idx) => (
                      <tr key={idx} className={styles.tableRow}>
                        <td className={styles.td}>{o.username}</td>
                        <td className={`${styles.td} text-cyan-400 font-bold`}>₹{o.total}</td>
                        <td className={styles.td}>
                          <span className={`px-2 py-0.5 text-[10px] font-bold border ${o.status === 'placed' ? 'border-cyan-500/30 text-cyan-400' : 'border-red-500/30 text-red-400'}`}>
                            {o.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className={styles.td}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Motion.div>
          )}

          {panel === "feedback" && (
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.card}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> BACK</button>
                  <h2 className="text-xs font-black tracking-[0.3em] text-cyan-500 uppercase">FEEDBACK_STREAM</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-2 rounded border border-cyan-500/10 bg-slate-950/50 p-1">
                    {[
                      { value: "all", label: "All" },
                      { value: "pending", label: "Pending" },
                      { value: "reviewed", label: "Reviewed" },
                      { value: "resolved", label: "Resolved" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFeedbackFilter(option.value)}
                        className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition ${feedbackFilter === option.value ? "bg-cyan-500 text-black" : "text-slate-400 hover:text-white"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500">
                    <span className="rounded border border-amber-500/20 px-2 py-1">Pending: {feedbackStats.pending}</span>
                    <span className="rounded border border-cyan-500/20 px-2 py-1">Reviewed: {feedbackStats.reviewed}</span>
                    <span className="rounded border border-emerald-500/20 px-2 py-1">Resolved: {feedbackStats.resolved}</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>User</th>
                      <th className={styles.tableHeader}>Problem</th>
                      <th className={styles.tableHeader}>Date</th>
                      <th className={styles.tableHeader}>Status</th>
                      <th className={styles.tableHeader}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(feedbackLoading ? Array.from({ length: 5 }) : filteredFeedbacks).map((item, idx) => {
                      if (!item) return null;
                      return (
                        <tr key={item._id || idx} className={styles.tableRow}>
                          <td className={styles.td}>{item.username || item.email || "Unknown"}</td>
                          <td className={styles.td}>{item.problem}</td>
                          <td className={styles.td}>{new Date(item.createdAt).toLocaleString()}</td>
                          <td className={styles.td}>
                            <select
                              value={item.status || "pending"}
                              onChange={(e) => handleFeedbackStatusChange(item._id, e.target.value)}
                              className="rounded border border-cyan-500/20 bg-slate-950/70 px-2 py-1 text-[10px] uppercase tracking-widest text-slate-200 outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </td>
                          <td className={styles.td}>
                            <button
                              onClick={() => handleDeleteFeedback(item._id)}
                              className="rounded border border-red-500/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-400 transition hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Motion.div>
          )}

          {panel === "activity" && (
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.card}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> BACK</button>
                  <h2 className="text-xs font-black tracking-[0.3em] text-cyan-500 uppercase">USER_ACTIVITY</h2>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <input
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="Search user / page / location"
                    className="w-full md:w-72 rounded border border-cyan-500/20 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
                  />
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="rounded border border-cyan-500/20 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
                  >
                    <option value="all">All users</option>
                    <option value="admin">Admins</option>
                    <option value="user">Users</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={styles.tableHeader}>User</th>
                      <th className={styles.tableHeader}>Last visit</th>
                      <th className={styles.tableHeader}>Time on pages</th>
                      <th className={styles.tableHeader}>Pages</th>
                      <th className={styles.tableHeader}>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activityLoading ? Array.from({ length: 5 }) : filteredActivitySummary).map((item, idx) => (
                      <tr
                        key={item.userId || idx}
                        className={`${styles.tableRow} cursor-pointer`}
                        onClick={() => loadUserTimeline(item.userId)}
                      >
                        <td className={styles.td}>{item.username || item.userId || "Guest"}</td>
                        <td className={styles.td}>{item.lastVisit ? new Date(item.lastVisit).toLocaleString() : "—"}</td>
                        <td className={styles.td}>{formatDuration(item.totalDurationSeconds)}</td>
                        <td className={styles.td}>{item.pagesVisited}</td>
                        <td className={styles.td}>
                          <div className="flex flex-col gap-1">
                            <span>{item.location || "Unknown"}</span>
                            <span className="text-[10px] uppercase tracking-widest text-cyan-400">
                              {item.locationSource === "ipapi" ? "IP tracked" : item.locationSource === "provided" ? "Provided" : "Unavailable"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 border-t border-cyan-500/10 pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500">FULL_TIMELINE</h3>
                  <span className="text-[10px] text-slate-500">
                    {selectedUserId ? "Selected user timeline" : "Click a user row to inspect their full visit history"}
                  </span>
                </div>

                {selectedUserLoading ? (
                  <div className="rounded border border-cyan-500/10 bg-slate-950/50 p-4 text-sm text-slate-400">Loading timeline...</div>
                ) : selectedUserHistory.length ? (
                  <div className="space-y-3">
                    {selectedUserHistory.map((entry, index) => (
                      <div key={entry._id || `${entry.visitedAt}-${index}`} className="rounded border border-cyan-500/10 bg-slate-950/50 p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{entry.pageTitle || entry.page || "Unknown page"}</p>
                            <p className="text-[11px] text-slate-400">{entry.page || "/"}</p>
                          </div>
                          <div className="text-right text-[11px] text-cyan-400">
                            <p>{new Date(entry.visitedAt).toLocaleString()}</p>
                            <p>{formatDuration(entry.durationSeconds || 0)}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-400">
                          <span>Location: {entry.location || "Unknown"}</span>
                          <span>IP: {entry.ipAddress || "Unavailable"}</span>
                          <span>Source: {entry.locationSource || "unavailable"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-cyan-500/20 bg-slate-950/30 p-4 text-sm text-slate-400">
                    No timeline selected yet.
                  </div>
                )}
              </div>
            </Motion.div>
          )}

          {panel === "analytics" && (
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.card}>
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> BACK</button>
                <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-lg">
                  {["daily", "monthly"].map(mode => (
                    <button key={mode} onClick={() => setChartMode(mode)} className={`px-4 py-1 text-[10px] font-bold uppercase transition-all ${chartMode === mode ? 'bg-cyan-500 text-black' : 'text-slate-500'}`}>{mode}</button>
                  ))}
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a1120', border: '1px solid #06b6d433', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fill="url(#colorRev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid md:grid-cols-2 gap-8 mt-10 pt-10 border-t border-white/5">
                <div>
                  <h3 className="text-cyan-500 text-[10px] font-black mb-4 uppercase tracking-widest">Top Selling Units</h3>
                  {productRanking.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-white/5 text-[11px]">
                      <span className="text-slate-400 truncate w-40">{p.id}</span>
                      <span className="text-cyan-400 font-bold">₹{p.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-cyan-500/5 p-6 rounded-xl border border-cyan-500/10 space-y-3">
                    <p className="text-[10px] flex justify-between"><span>PEAK_REVENUE</span> <span className="text-cyan-400">₹{monthlyStats.highest.toLocaleString()}</span></p>
                    <p className="text-[10px] flex justify-between"><span>FLOOR_REVENUE</span> <span className="text-cyan-400">₹{monthlyStats.lowest.toLocaleString()}</span></p>
                    <p className="text-[10px] flex justify-between"><span>GROWTH_RATE</span> <span className="text-cyan-400">{monthlyStats.progress}</span></p>
                </div>
              </div>
            </Motion.div>
          )}

          {["products", "tshirts", "books", "blogs"].includes(panel) && (
            <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.card}>
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <button onClick={() => setPanel("main")} className={styles.actionBtn}><FaArrowLeft /> TERMINATE</button>
                <span className="text-cyan-500 font-black text-[10px] uppercase tracking-widest">UPLINK::{panel}</span>
              </div>
              <div className="bg-black/40 p-4 rounded-xl">
                {panel === "products" && <AdminProductsAdd />}
                {panel === "tshirts" && <AdminTShirtsAdd />}
                {panel === "books" && <AdminBookAdd />}
                {panel === "blogs" && <AdminBlogAdd />}
              </div>
            </Motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
        <span>System: Neo-Phoenix V3</span>
        <span className="text-cyan-900 animate-pulse">Connection: Secure</span>
        <span>&copy; TechKart 2026</span>
      </footer>
    </div>
  );
};

export default AdminDashboard;