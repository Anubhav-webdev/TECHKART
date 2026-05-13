import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

const StockContext = createContext();

export const useStock = () => useContext(StockContext);

export const StockProvider = ({ children }) => {
  // =========================
  // STOCK STATE
  // =========================
  const [stocks, setStocks] = useState({});

  // =========================
  // SAFE API BASE URL
  // =========================
  const RAW_API =
    import.meta.env.VITE_API_URL?.trim() ||
    "https://techkart-ava8.onrender.com/api";

  const API = RAW_API.includes("/api")
    ? RAW_API.replace(/\/+$/, "")
    : `${RAW_API.replace(/\/+$/, "")}/api`;

  // =========================
  // GET STOCK
  // =========================
  const getStock = useCallback(
    (id) => {
      if (!id) return null;

      return stocks[id] ?? null;
    },
    [stocks]
  );

  // =========================
  // SET SINGLE STOCK
  // =========================
  const setStock = useCallback((id, value) => {
    if (!id) return;

    setStocks((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  // =========================
  // SET MULTIPLE STOCKS
  // =========================
  const setStocksFromProducts = useCallback((products = []) => {
    const stockMap = {};

    products.forEach((product) => {
      const id = product._id || product.id;

      if (!id) return;

      stockMap[id] =
        product.stock ??
        product.quantity ??
        product.qty ??
        product.available ??
        0;
    });

    if (Object.keys(stockMap).length > 0) {
      setStocks((prev) => ({
        ...prev,
        ...stockMap,
      }));
    }
  }, []);

  // =========================
  // FETCH STOCKS FROM SERVER
  // =========================
  const fetchAndSetStocks = useCallback(
    async (ids = []) => {
      try {
        let url = `${API}/products`;

        // Optional query
        if (Array.isArray(ids) && ids.length > 0) {
          const query = ids.map(encodeURIComponent).join(",");

          url = `${API}/products?ids=${query}`;
        }

        console.log("Fetching Stocks:", url);

        const res = await fetch(url);

        // Handle bad response
        if (!res.ok) {
          const txt = await res.text().catch(() => "");

          console.error(
            "StockContext.fetchAndSetStocks bad response",
            res.status,
            txt
          );

          return null;
        }

        // Safe text parsing
        const text = await res.text();

        console.log("Stock Response:", text);

        let data = [];

        try {
          data = text ? JSON.parse(text) : [];
        } catch (err) {
          console.error("Invalid JSON Response:", text);

          return null;
        }

        // Normalize products
        const products = Array.isArray(data)
          ? data
          : data.products || [];

        // Update stock state
        setStocksFromProducts(products);

        return products;
      } catch (err) {
        console.error(
          "StockContext.fetchAndSetStocks failed",
          err
        );

        return null;
      }
    },
    [API, setStocksFromProducts]
  );

  // =========================
  // ADJUST STOCK
  // =========================
  const adjustStock = useCallback((id, delta) => {
    if (!id) return;

    setStocks((prev) => {
      const current = prev[id] ?? 0;

      return {
        ...prev,
        [id]: Math.max(0, current + (delta || 0)),
      };
    });
  }, []);

  // =========================
  // RECONCILE ORDER
  // =========================
  const reconcileOrder = useCallback((cart = []) => {
    if (!Array.isArray(cart) || cart.length === 0) return;

    setStocks((prev) => {
      const next = { ...prev };

      cart.forEach((item) => {
        const id = item._id || item.id;

        const qty = item.quantity || 0;

        if (!id || !qty) return;

        const current = next[id] ?? 0;

        next[id] = Math.max(0, current - qty);
      });

      return next;
    });
  }, []);

  // =========================
  // CONTEXT PROVIDER
  // =========================
  return (
    <StockContext.Provider
      value={{
        stocks,
        getStock,
        setStock,
        setStocksFromProducts,
        fetchAndSetStocks,
        adjustStock,
        reconcileOrder,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export default StockContext;