// Backend API Base URL
const RAW_API =
     import.meta.env.VITE_API_URL?.trim() ||
     "https://techkart-ava8.onrender.com/api";

// Auto-fix missing /api
const API = RAW_API.endsWith("/api")
     ? RAW_API
     : `${RAW_API}/api`;


// =========================
// RESERVE PRODUCT
// =========================
const reserveProduct = async (id, qty = 1) => {
     try {
          const url = `${API}/products/${id}/reserve`;

          console.log("Reserve URL:", url);

          const res = await fetch(url, {
               method: "POST",
               headers: {
                    "Content-Type": "application/json",
               },
               body: JSON.stringify({
                    quantity: qty,
               }),
          });

          const text = await res.text();

          console.log("Reserve Response:", text);

          let data = {};

          try {
               data = text ? JSON.parse(text) : {};
          } catch (err) {
               console.error("Invalid JSON:", text);

               return {
                    ok: false,
                    error: "Server returned invalid response",
               };
          }

          if (!res.ok) {
               return {
                    ok: false,
                    error: data.message || "Reserve failed",
               };
          }

          // Update stock
          if (typeof data.stock === "number") {
               setStock(id, data.stock);
          } else {
               adjustStock(id, -qty);
          }

          return {
               ok: true,
               stock: data.stock,
          };
     } catch (err) {
          console.error("reserveProduct failed:", err);

          return {
               ok: false,
               error: err.message || "Server error",
          };
     }
};


// =========================
// RELEASE PRODUCT
// =========================
const releaseProduct = async (id, qty = 1) => {
     try {
          const url = `${API}/products/${id}/release`;

          console.log("Release URL:", url);

          const res = await fetch(url, {
               method: "POST",
               headers: {
                    "Content-Type": "application/json",
               },
               body: JSON.stringify({
                    quantity: qty,
               }),
          });

          const text = await res.text();

          console.log("Release Response:", text);

          let data = {};

          try {
               data = text ? JSON.parse(text) : {};
          } catch (err) {
               console.error("Invalid JSON:", text);

               return {
                    ok: false,
                    error: "Server returned invalid response",
               };
          }

          if (!res.ok) {
               return {
                    ok: false,
                    error: data.message || "Release failed",
               };
          }

          // Update stock
          if (typeof data.stock === "number") {
               setStock(id, data.stock);
          } else {
               adjustStock(id, qty);
          }

          return {
               ok: true,
               stock: data.stock,
          };
     } catch (err) {
          console.error("releaseProduct failed:", err);

          return {
               ok: false,
               error: err.message || "Server error",
          };
     }
};