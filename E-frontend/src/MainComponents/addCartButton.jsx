import { useCart } from "../context/CartContext";
import { useStock } from "../context/StockContext";
import React, { useEffect, useRef } from "react";


const AddCartButton = ({ product }) => {
     const { addToCart } = useCart();
     const { getStock, fetchAndSetStocks } = useStock();
const popupStyle =
  "fixed top-5 right-5 z-[9999] bg-black text-cyan-400 px-4 py-2 rounded-lg border border-cyan-500 text-sm font-bold transition-opacity duration-300";
     useEffect(() => {
          if (product?._id) fetchAndSetStocks([product._id]);
     }, [product, fetchAndSetStocks]);
const popupTimeout = useRef(null);


const popup = (message) => {
  const existing = document.getElementById("popup-msg");
  if (existing) existing.remove();

  const popupDiv = document.createElement("div");
  popupDiv.id = "popup-msg";
  popupDiv.className = popupStyle;
  popupDiv.innerText = message;

  popupDiv.style.opacity = "0";
  document.body.appendChild(popupDiv);

  requestAnimationFrame(() => {
    popupDiv.style.opacity = "1";
  });

  if (popupTimeout.current) {
    clearTimeout(popupTimeout.current);
  }

  popupTimeout.current = setTimeout(() => {
    popupDiv.style.opacity = "0";
    setTimeout(() => popupDiv.remove(), 300);
  }, 2000);
};



const handleClick = async () => {
  const productName = product?.title || product?.name || "Item";

  const ctxStock = getStock(product?._id);
  const stock =
    ctxStock ??
    product?.stock ??
    product?.quantity ??
    product?.qty ??
    product?.available ??
    0;

  if (stock <= 0) {
    popup(`${productName} is Sold Out!`);
    return;
  }

  try {
    const result = await addToCart(product);

    if (result?.ok) {
      popup(`${productName} added to cart!`);
    } else {
      popup(result?.error || `${productName} could not be added`);
    }
  } catch (err) {
    console.error(err);
    popup("Failed to add to cart");
  }
};


   
     const stockVal = getStock(product?._id) ?? product?.stock ?? product?.quantity ?? product?.qty ?? product?.available ?? 0;
     const isOut = stockVal <= 0; 

     return (
          <button
               onClick={handleClick}
               disabled={isOut}
               className={`bg-gradient-to-r from-teal-600 to-blue-600  text-white py-2 px-8 rounded-md cursor-pointer
 opacity-0 group-hover:opacity-100  translate-y-5 group-hover:translate-y-3 transition-all duration-300 ease-in-out
 ${isOut ? "bg-gradient-to-r from-gray-600 to-red-600  cursor-not-allowed  opacity-0" : ""}`}
          >
               {isOut ? "Sold Out" : "Add to Cart"}
          </button>
     );
};

export default AddCartButton;
