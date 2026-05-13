import React, { createContext, useContext, useState, useCallback } from 'react';

const StockContext = createContext();
export const useStock = () => useContext(StockContext);

export const StockProvider = ({ children }) => {
  // Map of productId -> numeric stock
  const [stocks, setStocks] = useState({});

  const getStock = useCallback((id) => {
    if (!id) return null;
    return stocks[id] ?? null;
  }, [stocks]);

  const setStock = useCallback((id, value) => {
    if (!id) return;
    setStocks(prev => ({ ...prev, [id]: value }));
  }, []);

  const setStocksFromProducts = useCallback((products = []) => {
    const map = {};
    products.forEach(p => {
      const id = p._id || p.id;
      if (!id) return;
      map[id] = p.stock ?? p.quantity ?? p.qty ?? p.available ?? 0;
    });
    if (Object.keys(map).length > 0) setStocks(prev => ({ ...prev, ...map }));
  }, []);

  const fetchAndSetStocks = useCallback(async (ids = []) => {
    try {
      // Default to Vite proxy in development, or the deployed backend in production.
      const base = (import.meta.env.VITE_API_URL?.trim() || 'https://techkart-ava8.onrender.com/api').replace(/\/+$/, '');
      let url = `${base}/products`;
      if (Array.isArray(ids) && ids.length > 0) {
        // Try API with ids query param; server may ignore it and return all products
        const q = ids.map(encodeURIComponent).join(',');
        url = `${base}/products?ids=${q}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        console.error('StockContext.fetchAndSetStocks bad response', res.status, txt);
        return null;
      }
      const data = await res.json();
      const products = Array.isArray(data) ? data : (data.products || []);
      setStocksFromProducts(products);
      return products;
    } catch (err) {
      console.error('StockContext.fetchAndSetStocks failed', err);
      return null;
    }
  }, [setStocksFromProducts]);

  const adjustStock = useCallback((id, delta) => {
    if (!id) return;
    setStocks(prev => {
      const cur = prev[id] ?? 0;
      return { ...prev, [id]: Math.max(0, cur + (delta || 0)) };
    });
  }, []);

  const reconcileOrder = useCallback((cart = []) => {
    // cart: array of { _id, quantity }
    if (!Array.isArray(cart) || cart.length === 0) return;
    setStocks(prev => {
      const next = { ...prev };
      cart.forEach(item => {
        const id = item._id || item.id;
        const qty = item.quantity || 0;
        if (!id || !qty) return;
        const cur = next[id] ?? 0;
        next[id] = Math.max(0, cur - qty);
      });
      return next;
    });
  }, []);

  return (
    <StockContext.Provider value={{ stocks, getStock, setStock, setStocksFromProducts, fetchAndSetStocks, adjustStock, reconcileOrder }}>
      {children}
    </StockContext.Provider>
  );
};
