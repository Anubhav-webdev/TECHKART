import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import CountUp from "react-countup";
import { API_BASE_URL } from "../config/apiConfig";

import {
  FaBox,
  FaTshirt,
  FaBook,
  FaNewspaper,
  FaArrowLeft,
  FaHome,
  FaSync,
  FaChartLine,
  FaShoppingBag,
  FaGhost,
  FaShieldAlt
} from "react-icons/fa";

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";

import AdminBlogAdd from "./AdminBlogAdd";
import AdminTShirtsAdd from "./AdminTshirtsAdd";
import AdminProductsAdd from "./AdminProductsAdd";
import AdminBookAdd from "./AdminBookAdd";

const styles = {
  card:
    "bg-[#0a0f1a]/80 backdrop-blur-md border border-cyan-500/20 rounded-br-3xl rounded-tl-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden mb-6 group transition-all duration-500 hover:border-cyan-500/50",

  actionBtn:
    "bg-transparent hover:bg-cyan-500 hover:text-black border border-cyan-500/50 text-cyan-400 px-5 py-2 rounded-none skew-x-[-12deg] transition-all duration-300 font-bold uppercase tracking-widest flex items-center gap-2 text-xs active:scale-95",

  navCard:
    "relative cursor-pointer group p-6 border border-slate-800 bg-slate-900/30 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-500 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center",

  tableHeader:
    "text-cyan-600 uppercase text-[9px] font-black tracking-[0.3em] py-4 px-4 text-left border-b border-cyan-500/10",

  tableRow:
    "border-b border-white/5 hover:bg-cyan-500/5 transition-colors group",

  td:
    "py-4 px-4 text-xs font-medium text-slate-400 group-hover:text-white transition-colors"
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const AdminDashboard = () => {
  const [panel, setPanel] = useState("main");
  const [users, setUsers] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chartMode, setChartMode] = useState("daily");

  // ================= VALID ORDER CHECK =================
  const isValidOrder = (status) => {
    const s = status?.toLowerCase();

    return (
      s === "placed" ||
      s === "success" ||
      s === "completed"
    );
  };

  // ================= FETCH DASHBOARD =================
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // USERS
      const usersRes = await fetch(`${API_BASE_URL}/auth/all`);

      if (!usersRes.ok) {
        throw new Error("Failed to fetch users");
      }

      const usersData = await usersRes.json();

      console.log("USERS DATA:", usersData);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setUserCount(Array.isArray(usersData) ? usersData.length : 0);

      // PRODUCTS
      const productRes = await fetch(`${API_BASE_URL}/products/count`);

      if (!productRes.ok) {
        throw new Error("Failed to fetch products");
      }

      const productData = await productRes.json();

      setProductCount(productData.total || 0);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ================= ANALYTICS =================
  const analytics = useMemo(() => {
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalItemsSold = 0;

    users.forEach((user) => {
      (user.orders || []).forEach((order) => {

        if (!isValidOrder(order.status)) return;

        totalOrders++;

        totalRevenue += Number(order.total || 0);

        (order.items || []).forEach((item) => {
          totalItemsSold += Number(item.quantity || 0);
        });
      });
    });

    return {
      totalOrders,
      totalRevenue,
      totalItemsSold
    };
  }, [users]);

  // ================= ALL ORDERS =================
  const allOrders = useMemo(() => {
    return users.flatMap((u) =>
      (u.orders || []).map((o) => ({
        ...o,
        username: u.username
      }))
    );
  }, [users]);

  // ================= REVENUE DATA =================
  const revenueData = useMemo(() => {
    const map = {};

    users.forEach((user) => {
      (user.orders || []).forEach((order) => {

        if (!isValidOrder(order.status)) return;

        const d = new Date(order.createdAt);

        const key =
          chartMode === "daily"
            ? d.toISOString().slice(0, 10)
            : `${d.getFullYear()}-${d.getMonth() + 1}`;

        map[key] =
          (map[key] || 0) + Number(order.total || 0);
      });
    });

    return Object.entries(map).map(([date, revenue]) => ({
      date,
      revenue
    }));
  }, [users, chartMode]);

  // ================= PRODUCT RANKING =================
  const productRanking = useMemo(() => {
    const map = {};

    users.forEach((user) => {
      (user.orders || []).forEach((order) => {

        if (!isValidOrder(order.status)) return;

        (order.items || []).forEach((item) => {

          const key =
            item?.name ||
            item?.title ||
            item?.product?._id ||
            "Unknown Product";

          if (!map[key]) {
            map[key] = {
              qty: 0,
              revenue: 0
            };
          }

          map[key].qty += Number(item.quantity || 0);

          map[key].revenue +=
            Number(item.quantity || 0) *
            Number(item.price || 0);
        });
      });
    });

    return Object.entries(map)
      .map(([id, val]) => ({
        id,
        ...val
      }))
      .sort((a, b) => b.revenue - a.revenue);

  }, [users]);

  // ================= MONTHLY STATS =================
  const monthlyStats = useMemo(() => {
    const map = {};

    users.forEach((user) => {
      (user.orders || []).forEach((order) => {

        if (!isValidOrder(order.status)) return;

        const d = new Date(order.createdAt);

        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;

        if (!map[key]) {
          map[key] = {
            revenue: 0,
            orders: 0
          };
        }

        map[key].revenue += Number(order.total || 0);

        map[key].orders += 1;
      });
    });

    const months = Object.entries(map).map(([month, data]) => ({
      month,
      ...data
    }));

    if (months.length === 0) {
      return {
        highest: 0,
        lowest: 0,
        latency: "0 cycles",
        progress: "0%"
      };
    }

    const highest = Math.max(...months.map((m) => m.revenue));

    const lowest = Math.min(...months.map((m) => m.revenue));

    const avg =
      months.reduce((a, b) => a + b.revenue, 0) / months.length;

    const progress =
      avg > 0 ? ((highest - lowest) / avg) * 100 : 0;

    return {
      highest,
      lowest,
      latency: `${months.length} cycles`,
      progress: `${progress.toFixed(1)}%`
    };
  }, [users]);

  return (
    <div className="min-h-screen bg-[#020406] text-orange-600 font-mono">

      <main className="max-w-7xl mx-auto p-8">

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 uppercase">

          {[
            {
              label: "totalRevenue",
              val: analytics.totalRevenue,
              color: "text-cyan-500",
              prefix: "₹"
            },
            {
              label: "totalOrders",
              val: analytics.totalOrders,
              color: "text-pink-700"
            },
            {
              label: "totalItemsSold",
              val: analytics.totalItemsSold,
              color: "text-blue-400"
            },
            {
              label: "TOTAL STOCKS",
              val: productCount,
              color: "text-green-500"
            },
            {
              label: "REGISTERED USER",
              val: userCount,
              color: "text-orange-500"
            }
          ].map((stat, i) => (
            <div key={i} className={styles.card}>
              <p className="text-[10px] uppercase tracking-widest text-cyan-600/70 font-bold mb-2">
                {stat.label}
              </p>

              <h2 className={`text-3xl font-black ${stat.color}`}>
                {stat.prefix}
                <CountUp
                  end={stat.val}
                  separator=","
                  duration={2.5}
                />
              </h2>
            </div>
          ))}
        </div>

        {/* CHART */}
        <div className={styles.card}>

          <div className="h-[350px] w-full">

            <ResponsiveContainer>

              <AreaChart data={revenueData}>

                <defs>
                  <linearGradient
                    id="colorRev"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#06b6d4"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor="#06b6d4"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fill: "orange", fontSize: 10 }}
                />

                <YAxis
                  tick={{ fill: "red", fontSize: 10 }}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className={styles.card}>

          <h2 className="text-cyan-500 mb-6 font-bold uppercase">
            Top Selling Products
          </h2>

          <div className="space-y-3">

            {productRanking.map((p, i) => (
              <div
                key={i}
                className="flex justify-between border border-slate-800 p-4 rounded-lg"
              >
                <span>{p.id}</span>

                <span className="text-cyan-400 font-bold">
                  ₹{p.revenue.toLocaleString()}
                </span>
              </div>
            ))}

          </div>
        </div>

        {/* MONTHLY STATS */}
        <div className={styles.card}>

          <h2 className="text-cyan-500 mb-4 uppercase font-bold">
            Monthly Statistics
          </h2>

          <div className="space-y-3">

            <p>
              MAX Revenue:
              ₹{monthlyStats.highest.toLocaleString()}
            </p>

            <p>
              MIN Revenue:
              ₹{monthlyStats.lowest.toLocaleString()}
            </p>

            <p>
              Latency:
              {monthlyStats.latency}
            </p>

            <p>
              Progress:
              {monthlyStats.progress}
            </p>

          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;