import React, { useState } from 'react';
import { FiSearch, FiClipboard, FiPackage, FiUser, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from "../context/AuthContext";


const maskEmail = (email) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
};

const OrderTracking = () => {
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [owner, setOwner] = useState(null);
  const { user: authUser } = useAuth();

  const handleSearch = async (e) => {
    e?.preventDefault();
    const code = (ref || '').trim();
    if (!code) return setError('Enter a tracking reference');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/users/orders/track/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order not found');
      setOrder(data.order);
      setOwner(data.owner || null);
    } catch (err) {
      setOrder(null);
      setOwner(null);
      setError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!order?.trackingRef) return;
    try { 
        await navigator.clipboard.writeText(order.trackingRef); 
        // Small toast logic could go here
    } catch { 
        alert('Copy failed'); 
    }
  };

 const handleCancel = async () => {
  // Ensure ids are matched with what the server returns (owner.id not owner._id)
  if (!owner || !order || !authUser || authUser.id !== owner.id) {
    alert("Unauthorized cancel attempt");
    return;
  }

  if (!window.confirm("Are you sure you want to cancel this order?")) return;

  try {
    // Use a relative path so it works with proxy or deployed host
    const res = await fetch(
      `/api/users/${owner.id}/orders/${order._id}/status`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      }
    );

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server did not return JSON");
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Cancel failed");

    setOrder(data.order);
    alert("Order cancelled successfully");
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to cancel order");
  }
};


  return (
    <div className="min-h-screen pt-10 pb-10 px-4 bg-gray-950 text-gray-100">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
       <div className="text-center mb-8">
                              <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
                                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-400 to-purple-400">
                                        Track Your Order
                                   </span>
                              </h2>
                              <p className="text-gray-400">Enter your tracking reference to see your order status.</p>
                         </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative group mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                value={ref} 
                onChange={(e) => setRef(e.target.value)} 
                placeholder="ORD-ABCD1234" 
                className="w-full pl-11 pr-4 py-3.5 bg-gray-900 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-600" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="sm:px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? 'Searching...' : 'Track Now'}
            </button>
          </div>
          {error && <p className="text-sm text-red-400 mt-3 flex items-center gap-2 font-medium"> <FiInfo /> {error}</p>}
        </form>

        {/* Order Details Card */}
        {order && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Status Bar */}
            <div className="p-5 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4 bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <FiPackage className="text-indigo-400 text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Tracking Reference</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-indigo-300 font-medium">{order.trackingRef}</span>
                    <button onClick={handleCopy} className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-500 hover:text-white">
                      <FiClipboard size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                  order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 
                  ['shipped', 'delivered'].includes(order.status) ? 'bg-emerald-500/10 text-emerald-400' : 
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  ● {order.status}
                </span>
                <p className="text-[10px] text-gray-500 mt-1 uppercase">{new Date(order.createdAt).toLocaleDateString()}// {new Date(order.createdAt).toLocaleTimeString()}</p>

              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Billing & Owner Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FiUser className="text-indigo-400" /> Customer Info
                  </h3>
                  <div className="space-y-1">
                    <p className="text-white font-medium">{order.billing?.username || owner?.username || '—'}</p>
                    <p className="text-sm text-gray-400">{maskEmail(owner?.email)}</p>
                    <p className="text-sm text-gray-400">{order.billing?.phone}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-950/50 rounded-xl border border-gray-800/50">
                   <h3 className="text-[10px] font-black text-gray-500 uppercase mb-2">Internal Reference</h3>
                   <p className="text-[11px] font-mono text-gray-500 break-all leading-tight">{order._id}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-800/50 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-gray-200 font-medium">{(item.name || item.title) || 'Product Item'}</span>
                        <span className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</span>
                      </div>
                      <span className="text-gray-200 font-semibold">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-between items-center border-t border-gray-700">
                    <span className="text-lg font-bold text-white">Total Amount</span>
                    <span className="text-xl font-black text-indigo-400">₹{order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {authUser && owner && authUser.id === owner.id && !['cancelled', 'delivered'].includes(order.status) && (
                <button 
                  onClick={handleCancel} 
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl font-bold transition-all"
                >
                  Cancel This Order
                </button>
              )}
              
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-950/50 p-3 rounded-lg">
                <FiCheckCircle className="text-emerald-500" />
                <span>Verified order from our official store.</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        {!order && (
          <div className="mt-12 flex flex-col items-center text-center">
             <div className="w-16 h-1 bg-gray-800 rounded-full mb-6"></div>
             <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
               Need help? Contact our support team with your reference number for manual assistance.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;