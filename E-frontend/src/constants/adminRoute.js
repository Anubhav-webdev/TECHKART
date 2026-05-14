// Admin route protection key (same for routing and login redirect)
// In prod, consider using a secure environment variable or proper auth guard instead.

const protectKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
export const adminProtectKey = protectKey;
