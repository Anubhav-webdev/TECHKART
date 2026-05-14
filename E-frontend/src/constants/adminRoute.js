// Admin route protection key (same for routing and login redirect)
// Use an environment variable when available so the route remains consistent across deploys.
const protectKey = import.meta.env.VITE_ADMIN_KEY?.trim() || "admin-techkart-dashboard-2024";
export const adminProtectKey = protectKey;
