import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, CreditCard, LogOut, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, logout, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ label: '', address: '', city: '', state: '', zip: '', country: '', phone: '' });

const getAvatarUrl = (avatar) => {
  if (!avatar || avatar === '/default-avatar.svg') return '/default-avatar.svg';
  if (
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('data:') ||
    avatar.startsWith('blob:')
  ) return avatar;
  if (avatar.startsWith('/uploads')) return `http://localhost:7000${avatar}`;
  return avatar;
};



  useEffect(() => {
    if (!user || !user.id) return;
    setLoading(true);
    fetch(`/api/users/${user.id}`)
      .then(res => res.json())
      .then(data => {
        const next = data.user;
        setProfile(next);
        setAvatarPreview(getAvatarUrl(next?.avatar));
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || !user.id) return;
    if (activeTab === 'orders') {
      fetch(`/api/users/${user.id}/orders`).then(r => r.json()).then(d => setOrders(d.orders || []));
    }
    if (activeTab === 'address') {
      fetch(`/api/users/${user.id}/addresses`).then(r => r.json()).then(d => setAddresses(d.addresses || []));
    }
  }, [activeTab, user]);

  // total items across all orders
  const totalOrderItems = orders.reduce((acc, o) => acc + (o.items?.length || 0), 0);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !user.id || !profile) return;
    setLoading(true);
    const body = {
      username: profile.username || profile.fullName,
      email: profile.email,
      phone: profile.phone,
      fullName: profile.fullName || profile.username,
      birthday: profile.birthday
    };
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Update failed');
      setProfile(data.user);
      if (login) login(data.user);
      alert('Profile updated');
    } catch {
      alert('Server error');
    } finally { setLoading(false); }
  };

  const handleAvatarChange = async (e) => {
    if (!user || !user.id) return alert('Please log in to upload an avatar.');
    const file = e.target?.files?.[0];
    if (!file) return;

    // Basic validations
    if (!file.type.startsWith('image/')) return alert('Please select a valid image file.');
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) return alert('Image must be smaller than 2 MB.');

    const fd = new FormData();
    fd.append('avatar', file);
    setAvatarPreview(URL.createObjectURL(file));

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}/avatar`, { method: 'POST', body: fd });
      // try to parse json safely
      const data = await res.json().catch(() => null);
      if (!res.ok) return alert((data && data.message) || 'Upload failed');

      if (!data || !data.avatar) return alert('Upload succeeded but no avatar URL returned');

      const newAvatar = getAvatarUrl(data.avatar);
      setAvatarPreview(newAvatar);
      setProfile(prev => {
        const updated = { ...prev, avatar: data.avatar };
        if (login) login({ ...user, ...updated });
        return updated;
      });

      // reset the file input so same file can be selected again
      try { e.target.value = ''; } catch { }

      alert('Avatar updated');
    } catch (err) {
      console.error('Avatar upload error:', err);
      alert('Upload failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!user || !user.id) return alert('Please log in to add an address.');
    if (!newAddress.label || !newAddress.address) return alert('Please provide a label and address.');
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${user.id}/addresses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newAddress) });
      const data = await res.json().catch(() => null);
      if (!res.ok) return alert((data && data.message) || 'Add failed');
      setAddresses(data.addresses || data.user?.addresses || []);
      setNewAddress({ label: '', address: '', city: '', state: '', zip: '', country: '', phone: '' });
    } catch (err) {
      console.error('Add address failed', err);
      alert('Add address failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAddress = async (id) => {
    if (!user || !user.id) return alert('Please log in to remove an address.');
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${user.id}/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (!res.ok) return alert((data && data.message) || 'Remove failed');
      setAddresses(data.addresses || data.user?.addresses || []);
    } catch (err) {
      console.error('Remove address failed', err);
      alert('Remove address failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Please log in to view your profile.</div>
  );

  const avatarSrc = avatarLoadError
    ? '/default-avatar.svg'
    : avatarPreview
      ? avatarPreview
      : profile?.avatar
        ? getAvatarUrl(profile.avatar)
        : '/default-avatar.svg';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">

        {/* --- Sidebar Navigation --- */}
        <aside className="md:col-span-1 space-y-4">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 flex flex-col items-center">
            <div className="relative group">
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-800"
                onError={(e) => {
                  if (!avatarLoadError) {
                    setAvatarLoadError(true);
                    e.target.src = '/default-avatar.svg';
                  }
                }}
              />
              <label className="absolute bottom-0 right-0 bg-indigo-500 p-2 rounded-full text-white shadow-lg hover:bg-indigo-600 transition-colors cursor-pointer">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <h2 className="mt-4 font-bold text-gray-100 text-lg">{profile?.fullName || profile?.username || 'User'}</h2>
            <p className="text-sm text-gray-400">Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</p>
          </div>

          <nav className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
            {[
              { id: 'profile', label: 'Account Info', icon: <User size={20} /> },
              { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
              { id: 'address', label: 'Addresses', icon: <MapPin size={20} /> },
              { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={20} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-4 transition-all ${activeTab === item.id
                  ? 'bg-indigo-900/30 text-indigo-400 border-r-4 border-indigo-500'
                  : 'text-gray-400 hover:bg-gray-800'
                  }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            <button onClick={() => logout()} className="w-full flex items-center space-x-3 px-6 py-4 text-red-400 hover:bg-red-900/20 transition-all border-t border-gray-800">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </aside>

        {/* --- Main Content Area --- */}
        <main className="md:col-span-3">
          <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 md:p-8">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-gray-100">Account Settings</h1>
              <p className="text-gray-400">Manage your personal information and preferences.</p>
            </header>

            {activeTab === 'profile' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile?.fullName || profile?.username || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value, username: prev?.username || e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profile?.phone || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Birthday</label>
                    <input
                      type="date"
                      value={profile?.birthday ? new Date(profile.birthday).toISOString().slice(0, 10) : ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, birthday: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end space-x-4">
                  <button type="button" className="px-6 py-2.5 rounded-xl text-gray-400 font-semibold hover:bg-gray-800 transition-all">
                    Cancel
                  </button>
                  <button disabled={loading} type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 transition-all disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-200">Your Orders <span className="text-indigo-400">({totalOrderItems} items)</span></h2>
                {orders.length === 0 ? <p className="text-gray-500">No orders yet</p> : orders.map((o, idx) => (
                  <div key={idx} className="p-4 bg-gray-800 border border-gray-700 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-gray-200 font-medium">Items : {o.items?.length || 0}</div>
                      <div className="text-indigo-400 font-bold">${o.total}</div>
                    </div>
                    <div className="text-sm text-gray-400">Status: <span className="text-gray-300 italic">{o.status}</span></div>
                    <div className="text-sm text-gray-400">Order Date: <span className="text-gray-300 italic">{new Date(o.createdAt).toLocaleDateString()}</span></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'address' && (
              <div className="space-y-6">
                <h2 className="font-semibold text-gray-200">Addresses</h2>
                {addresses.length === 0 && <p className="text-gray-500">No addresses saved.</p>}
                <div className="grid grid-cols-1 gap-4">
                  {addresses.map(a => (
                    <div key={a._id} className="p-4 bg-gray-800 border border-gray-700 rounded-xl flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-indigo-400 uppercase text-xs tracking-wider mb-1">{a.label}</div>
                        <div className="text-sm text-gray-200">{a.address}</div>
                        <div className="text-sm text-gray-400">{a.city}, {a.state} {a.zip}</div>
                        <div className="text-sm text-gray-500 mt-2">{a.phone}</div>
                      </div>
                      <button onClick={() => handleRemoveAddress(a._id)} className="text-red-400 text-sm hover:underline">Remove</button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gray-950/50 border border-gray-800 rounded-xl">
                  <h3 className="font-medium text-gray-200 mb-4">Add New Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="Label (e.g. Home)" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    <input placeholder="Phone" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    <input placeholder="Address" value={newAddress.address} onChange={e => setNewAddress({ ...newAddress, address: e.target.value })} className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none col-span-2" />
                    <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    <input placeholder="Zip" value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    <input placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div className="mt-5 text-right">
                    <button onClick={handleAddAddress} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all">Add Address</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto text-gray-700 mb-4" />
                <h2 className="font-semibold text-gray-200 mb-2">Payment Methods</h2>
                <p className="text-gray-500">Secure payment management is coming soon.</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile;