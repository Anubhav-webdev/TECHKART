import React, { useState, useEffect } from "react";
import axios from "axios";


const API_URL = "https://techkart-ava8.onrender.com/api/tshirts";

const initialTShirtData = {
     name: "",
     brand: "",
     gender: "Unisex",
     sizeOptions: [],
     colorOptions: [],
     material: "",
     fit: "",
     pattern: "",
     sleeve: "",
     category: "t-shirt",
     description: "",
     price: 0,
     oldPrice: 0,
     discount: 0,
     stock: 0,
     rating: 0,
     reviews: [],
     image: "",
     gallery: [],
     deliveryInfo: "Delivered in 3–5 business days",
     returnPolicy: "7 Days Replacement Policy",
     offerTags: [],
};

// Function to calculate discount percentage
const calculateDiscount = (oldPrice, price) => {
     if (oldPrice > 0 && price >= 0) {
          return Math.round(((oldPrice - price) / oldPrice) * 100);
     }
     return 0;
};

const AdminTShirtsAdd = () => {
     const [tshirtData, setTshirtData] = useState(initialTShirtData);
     const [tshirts, setTShirts] = useState([]);
     const [editTShirtId, setEditTShirtId] = useState(null);
     const [loading, setLoading] = useState(false); // New loading state for fetch



     // ---------------- FETCH ----------------
     const fetchTShirts = async () => {
          setLoading(true);
          try {
               const res = await axios.get(API_URL);
               const cleaned = res.data.map(item => ({
                    ...item,
                    price: Number(item.price),
                    oldPrice: Number(item.oldPrice),
                    discount: Number(item.discount),
                    stock: Number(item.stock),
                    rating: Number(item.rating),
                    // Ensure arrays are initialized if null/undefined in API response
                    sizeOptions: item.sizeOptions || [],
                    colorOptions: item.colorOptions || [],
                    gallery: item.gallery || [],
                    offerTags: item.offerTags || [],
                    reviews: item.reviews || [],
               }));
               setTShirts(cleaned);
          } catch (err) {
               console.error("FETCH ERROR:", err);
               // Optionally, show an error to the user
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchTShirts();
     }, []);

     // ---------------- INPUT HANDLER ----------------
     const handleChange = e => {
          const { name, value } = e.target;

          // Arrays (comma separated string to array)
          if (["sizeOptions", "colorOptions", "gallery", "offerTags"].includes(name)) {
               setTshirtData(prev => ({
                    ...prev,
                    [name]: value.split(",").map(v => v.trim()).filter(v => v !== "")
               }));
               return;
          }

          // Numbers
          if (["price", "oldPrice", "discount", "stock", "rating"].includes(name)) {
               // Use parseFloat for potentially decimal numbers, parseInt for stock
               const parsedValue = name === "stock" ? parseInt(value) : parseFloat(value);
               const newValue = isNaN(parsedValue) ? 0 : parsedValue;

               setTshirtData(prev => {
                    const updatedData = { ...prev, [name]: newValue };

                    // Auto-calculate discount when price or oldPrice changes
                    if (name === "price" || name === "oldPrice") {
                         updatedData.discount = calculateDiscount(updatedData.oldPrice, updatedData.price);
                    }

                    return updatedData;
               });
               return;
          }

          setTshirtData(prev => ({ ...prev, [name]: value }));
     };

     // ---------------- ADD / UPDATE ----------------
     const handleSubmit = async e => {
          e.preventDefault();
          setLoading(true);

          try {
               if (editTShirtId) {
                    // UPDATE logic
                    await axios.put(`${API_URL}/update/${editTShirtId}`, tshirtData);
                    alert("T-shirt updated successfully! 🚀");

                    // Optimistically update the list without refetching all
                    setTShirts(prev => prev.map(t => (t._id === editTShirtId ? { ...t, ...tshirtData } : t)));

               } else {
                    // ADD logic
                    const res = await axios.post(`${API_URL}/add`, tshirtData);
                    alert("T-shirt added successfully! 🎉");
                    setTShirts(prev => [...prev, res.data]);
               }

               // Reset form and state
               setTshirtData(initialTShirtData);
               setEditTShirtId(null);
          } catch (err) {
               console.error("SAVE ERROR:", err.response ? err.response.data : err.message);
               alert(`Failed to save T-shirt. Error: ${err.response?.data?.message || err.message}`);
          } finally {
               setLoading(false);
          }
     };

     // ---------------- DELETE ----------------
     const handleDelete = async id => {
          if (!window.confirm("Are you sure you want to delete this T-shirt? This action cannot be undone.")) return;
          setLoading(true);

          try {
               await axios.delete(`${API_URL}/delete/${id}`);
               alert("Deleted successfully! 🗑️");
               setTShirts(prev => prev.filter(t => t._id !== id));
          } catch (err) {
               console.error("DELETE ERROR:", err);
               alert("Failed to delete.");
          } finally {
               setLoading(false);
          }
     };

     // ---------------- EDIT ----------------
     const handleEdit = item => {
          setEditTShirtId(item._id);
          // Prepare the array fields to be comma-separated strings for the inputs when editing
          const editData = {
               ...item,
               sizeOptions: item.sizeOptions || [],
               colorOptions: item.colorOptions || [],
               gallery: item.gallery || [],
               offerTags: item.offerTags || [],
               reviews: item.reviews || [],
          };
          // Recalculate discount to ensure it's accurate
          editData.discount = calculateDiscount(editData.oldPrice, editData.price);
          setTshirtData(editData);
          window.scrollTo({ top: 0, behavior: "smooth" });
     };

     const handleCancelEdit = () => {
          setEditTShirtId(null);
          setTshirtData(initialTShirtData);
     };

     // Helper for input placeholder text
     const getLabel = (field) => {
          const words = field.replace(/([A-Z])/g, ' $1').toLowerCase().split(' ');
          // Capitalize each word and join them
          const labelText = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

          if (field.includes("price")) return `${labelText} (₹)`;
          if (field === "discount") return `${labelText} (%)`;
          return labelText;
     }

     const getPlaceholder = (field) => {
          if (field.includes("price")) return `e.g., 499.99`;
          if (field === "oldPrice") return `e.g., 599.99 (before discount)`;
          if (field === "discount") return `e.g., 20 (for 20% off)`;
          if (field === "rating") return `0-5`;
          if (field === "stock") return `e.g., 100`;
          return ""; // Placeholder can be empty if the label is descriptive enough
     }

     // Determine button text and style
     const submitButtonText = editTShirtId ? "Update T-Shirt" : "Add T-Shirt";
     const submitButtonClass = editTShirtId
          ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
          : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";


     // ---------------- RENDER ----------------
     return (
          <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 rounded-2xl mt-12 mb-20 shadow-2xl transition-all duration-500 text-black">
               <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800 border-b pb-4">
                    {editTShirtId ? "✏️ Update T-Shirt Details" : "✨ Add New T-Shirt"}
               </h1>

               {/* ---------------- FORM ---------------- */}
               <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* Text fields */}
                         {["name", "brand", "material", "fit", "pattern", "sleeve"].map(field => (
                              <div key={field}>
                                   <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">{getLabel(field)}</label>
                                   <input
                                        id={field}
                                        type="text"
                                        name={field}
                                        value={tshirtData[field]}
                                        onChange={handleChange}
                                        placeholder={getPlaceholder(field)}
                                        required={field !== "description"}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                                   />
                              </div>
                         ))}

                         {/* Gender select */}
                         <div>
                              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                              <select
                                   id="gender"
                                   name="gender"
                                   value={tshirtData.gender}
                                   onChange={handleChange}
                                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm bg-white"
                              >
                                   <option value="Men">Men</option>
                                   <option value="Women">Women</option>
                                   <option value="Unisex">Unisex</option>
                              </select>
                         </div>
                    </div>

                    {/* Description */}
                    <div>
                         <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                         <textarea
                              id="description"
                              name="description"
                              value={tshirtData.description}
                              onChange={handleChange}
                              placeholder="Detailed product description (e.g., soft cotton blend, crew neck...)"
                              rows="3"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm resize-none"
                         ></textarea>
                    </div>

                    {/* Array fields (comma separated) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {["sizeOptions", "colorOptions", "offerTags"].map(field => (
                              <div key={field}>
                                   <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                                        {getLabel(field)} (Comma-Separated)
                                   </label>
                                   <input
                                        id={field}
                                        type="text"
                                        name={field}
                                        // Convert array to comma-separated string for the input field
                                        value={tshirtData[field].join(", ")}
                                        onChange={handleChange}
                                        placeholder={field === "sizeOptions" ? "e.g., S, M, L, XL" : field === "colorOptions" ? "e.g., Red, Blue, Black" : "e.g., New Arrival, Sale"}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                                   />
                              </div>
                         ))}
                         {/* Image fields */}
                         {["image", "gallery"].map(field => (
                              <div key={field}>
                                   <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                                        {getLabel(field)} URL {field === "gallery" && "(Comma-Separated)"}
                                   </label>
                                   <input
                                        id={field}
                                        type="text"
                                        name={field}
                                        // Special handling for gallery array conversion
                                        value={field === "gallery" ? tshirtData[field].join(", ") : tshirtData[field]}
                                        onChange={handleChange}
                                        placeholder={field === "gallery" ? "e.g., url1, url2, url3" : "e.g., main_image_url"}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                                   />
                              </div>
                         ))}
                    </div>

                    {/* Number fields */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                         {["price", "oldPrice", "discount", "stock", "rating"].map(field => (
                              <div key={field}>
                                   <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">{getLabel(field)}</label>
                                   <input
                                        id={field}
                                        type="number"
                                        step={field === "rating" || field.includes("price") || field === "discount" ? "0.01" : "1"}
                                        min={field === "rating" ? "0" : "0"}
                                        max={field === "rating" ? "5" : undefined}
                                        name={field}
                                        value={tshirtData[field]}
                                        onChange={handleChange}
                                        placeholder={getPlaceholder(field)}
                                        required
                                        readOnly={field === "discount"} // Make discount read-only as it's auto-calculated
                                        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm ${field === "discount" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                   />
                              </div>
                         ))}
                    </div>

                    {/* Submit and Cancel buttons */}
                    <div className="flex gap-4 pt-4">
                         <button
                              type="submit"
                              disabled={loading}
                              className={`w-full text-white p-3 rounded-lg font-bold shadow-md transform hover:scale-[1.01] transition duration-300 ease-in-out ${submitButtonClass} focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed`}
                         >
                              {loading && !editTShirtId ? "Adding..." : loading && editTShirtId ? "Updating..." : submitButtonText}
                         </button>
                         {editTShirtId && (
                              <button
                                   type="button"
                                   onClick={handleCancelEdit}
                                   disabled={loading}
                                   className="w-1/3 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg font-bold shadow-md transform hover:scale-[1.01] transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                   Cancel Edit
                              </button>
                         )}
                    </div>
               </form>

               <hr className="my-10 border-gray-300" />

               {/* ---------------- LIST ---------------- */}
               <h2 className="text-2xl font-extrabold mt-10 mb-6 text-gray-800">👕 Existing T-Shirts ({tshirts.length})</h2>

               {loading && !tshirts.length ? (
                    <div className="text-center p-8 text-lg text-gray-600">Loading T-Shirts...</div>
               ) : tshirts.length === 0 ? (
                    <div className="text-center p-8 text-lg text-gray-600">No T-shirts added yet.</div>
               ) : (
                    <div className="space-y-4">
                         {tshirts.map((item, index) => (
                              <div
                                   key={item._id || index}
                                   // Add a subtle fade-in animation for each item
                                   className={`p-5 border border-gray-200 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center bg-white hover:shadow-lg transition duration-300 ease-in-out transform hover:translate-y-[-2px] ${editTShirtId === item._id ? 'border-4 border-indigo-400 ring-2 ring-indigo-500' : ''}`}
                              >
                                   <div className="mb-3 md:mb-0 md:mr-4 flex-grow">
                                        <h3 className="font-semibold text-lg text-gray-900">{item.name} <span className="text-sm font-normal text-gray-500">({item.brand})</span></h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                             <span className="font-bold text-green-600">₹{item.price}</span> | Stock: {item.stock} | Rating: {item.rating}
                                        </p>
                                   </div>
                                   <div className="flex gap-3">
                                        <button
                                             onClick={() => handleEdit(item)}
                                             className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium shadow-sm transition duration-150 ease-in-out transform hover:scale-[1.05]"
                                        >
                                             Edit
                                        </button>
                                        <button
                                             onClick={() => handleDelete(item._id)}
                                             className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-sm transition duration-150 ease-in-out transform hover:scale-[1.05]"
                                        >
                                             Delete
                                        </button>
                                   </div>
                              </div>
                         ))}
                    </div>
               )}
          </div>
     );
};

export default AdminTShirtsAdd;