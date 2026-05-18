import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

const API_URL = `${API_BASE_URL}/electronics`;

const initialProductData = {
     name: "",
     brand: "",
     category: "mobile",
     featured: false,
     description: "",
     price: 0,
     oldPrice: 0,
     discount: 0,
     stock: 0,
     rating: 0,
     reviews: [],
     image: "",
     gallery: [],
     offerTags: [],

     specifications: {
          ram: "",
          storage: "",
          processor: "",
          battery: "",
          display: "",
          camera: "",
          os: "",
          warranty: "1 Year Warranty",
          type: "",
          connectivity: "",
          features: "",
     },

     deliveryInfo: "Delivered in 3–5 business days",
     returnPolicy: "7 Days Replacement Policy",
};

const calculateDiscount = (oldPrice, price) => {
     if (oldPrice > 0 && price >= 0) {
          return Math.round(((oldPrice - price) / oldPrice) * 100);
     }
     return 0;
};

const AdminProductsAdd = () => {
     const [productData, setProductData] = useState(initialProductData);
     const [products, setProducts] = useState([]);
     const [editId, setEditId] = useState(null);
     const [loading, setLoading] = useState(false);



     // ---------------- FETCH ----------------
     const fetchProducts = async () => {
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

                    gallery: item.gallery || [],
                    offerTags: item.offerTags || [],
                    reviews: item.reviews || [],
                    specifications: item.specifications || {},
               }));

               setProducts(cleaned);
          } catch (err) {
               console.error("FETCH ERROR:", err);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchProducts();
     }, []);

     // ---------------- INPUT HANDLER ----------------
     const handleChange = (e) => {
          const { name, value } = e.target;

          // Array fields
          if (["gallery", "offerTags"].includes(name)) {
               setProductData(prev => ({
                    ...prev,
                    [name]: value.split(",").map(v => v.trim()).filter(v => v !== "")
               }));
               return;
          }

          // Specifications object
          if (name.startsWith("spec_")) {
               const specKey = name.replace("spec_", "");
               setProductData(prev => ({
                    ...prev,
                    specifications: {
                         ...prev.specifications,
                         [specKey]: value
                    }
               }));
               return;
          }

          // Boolean fields
          if (name === "featured") {
               setProductData(prev => ({
                    ...prev,
                    [name]: value === "true"
               }));
               return;
          }

          // Numbers
          if (["price", "oldPrice", "discount", "stock", "rating"].includes(name)) {
               const parsed = parseFloat(value);
               setProductData(prev => {
                    const updatedData = {
                         ...prev,
                         [name]: isNaN(parsed) ? 0 : parsed
                    };

                    // Auto-calculate discount when price or oldPrice changes
                    if (name === "price" || name === "oldPrice") {
                         updatedData.discount = calculateDiscount(updatedData.oldPrice, updatedData.price);
                    }

                    return updatedData;
               });
               return;
          }

          setProductData(prev => ({ ...prev, [name]: value }));
     };

     const validateProductData = () => {
          const errors = [];

          if (!productData.name.trim()) {
               errors.push("Name is required.");
          }

          if (!productData.brand.trim()) {
               errors.push("Brand is required.");
          }

          if (!productData.description.trim()) {
               errors.push("Description is required.");
          }

          if (!productData.image.trim()) {
               errors.push("Image URL is required.");
          }

          if (productData.price <= 0 || Number.isNaN(productData.price)) {
               errors.push("Price must be greater than 0.");
          }

          if (productData.stock < 0 || Number.isNaN(productData.stock)) {
               errors.push("Stock cannot be negative.");
          }

          if (!["mobile", "laptop", "gadget"].includes(productData.category)) {
               errors.push("Category must be mobile, laptop, or gadget.");
          }

          return errors;
     };

     // ---------------- ADD / UPDATE ----------------
     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);

          const validationErrors = validateProductData();
          if (validationErrors.length > 0) {
               alert(validationErrors.join("\n"));
               setLoading(false);
               return;
          }

          try {
               if (editId) {
                    const res = await axios.put(`${API_URL}/update/${editId}`, productData);
                    alert("Product updated!");

                    setProducts(prev =>
                         prev.map(p => (p._id === editId ? { ...p, ...res.data } : p))
                    );
               } else {
                    const res = await axios.post(`${API_URL}/add`, productData);
                    alert("Product added successfully!");

                    setProducts(prev => [res.data.electronics || res.data, ...prev]);
               }

               setProductData(initialProductData);
               setEditId(null);
          } catch (err) {
               console.error("SAVE ERROR:", err);
               alert("Failed to save.");
          } finally {
               setLoading(false);
          }
     };

     // ---------------- DELETE ----------------
     const handleDelete = async (id) => {
          if (!window.confirm("Delete product?")) return;
          setLoading(true);

          try {
               await axios.delete(`${API_URL}/delete/${id}`);
               setProducts(prev => prev.filter(p => p._id !== id));
               alert("Deleted!");
          } catch (err) {
               console.error("DELETE ERROR:", err);
          } finally {
               setLoading(false);
          }
     };

     // ---------------- EDIT ----------------
     const handleEdit = (item) => {
          setEditId(item._id);
          const editData = {
               ...item,
               gallery: item.gallery || [],
               offerTags: item.offerTags || [],
               reviews: item.reviews || [],
               specifications: item.specifications || {},
          };
          // Recalculate discount to ensure it's accurate
          editData.discount = calculateDiscount(editData.oldPrice, editData.price);
          setProductData(editData);
          window.scrollTo({ top: 0, behavior: "smooth" });
     };
     const cancelEdit = () => {
          setEditId(null);
          setProductData(initialProductData);
     };

     return (
          <div className="p-8 max-w-5xl mx-auto bg-gray-100 rounded-2xl shadow-xl mt-12 mb-20 text-black">
               <h1 className="text-3xl font-extrabold mb-8 text-center">
                    {editId ? "✏️ Update Product" : "✨ Add New Product"}
               </h1>

               {/* FORM */}
               <form onSubmit={handleSubmit} className="space-y-6">

                    {/* BASIC FIELDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {["name", "brand", "description", "image"].map(field => (
                              <div key={field}>
                                   <label className="block font-medium mb-1">{field.toUpperCase()}</label>
                                   <input
                                        type="text"
                                        name={field}
                                        value={productData[field]}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg"
                                   />
                              </div>
                         ))}

                         {/* CATEGORY */}
                         <div>
                              <label className="block font-medium mb-1">Category</label>
                              <select
                                   name="category"
                                   value={productData.category}
                                   onChange={handleChange}
                                   className="w-full p-3 border rounded-lg"
                              >
                                   <option value="mobile">Mobile</option>
                                   <option value="laptop">Laptop</option>
                                   <option value="gadget">Gadget</option>
                              </select>
                         </div>

                         {/* FEATURED */}
                         <div>
                              <label className="block font-medium mb-1">Featured</label>
                              <select
                                   name="featured"
                                   value={productData.featured}
                                   onChange={handleChange}
                                   className="w-full p-3 border rounded-lg"
                              >
                                   <option value={false}>No</option>
                                   <option value={true}>Yes</option>
                              </select>
                         </div>
                    </div>

                    {/* ARRAYS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {["gallery", "offerTags"].map(field => (
                              <div key={field}>
                                   <label className="block font-medium mb-1">{field.toUpperCase()} (comma separated)</label>
                                   <input
                                        name={field}
                                        value={productData[field].join(", ")}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg"
                                   />
                              </div>
                         ))}
                    </div>

                    {/* NUMBERS */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                         {["price", "oldPrice", "discount", "stock", "rating"].map(field => (
                              <div key={field}>
                                   <label className="block font-medium mb-1">{field}</label>
                                   <input
                                        type="number"
                                        name={field}
                                        value={productData[field]}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg ${field === "discount" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                        min="0"
                                        max={field === "rating" ? "5" : undefined}
                                        step="0.01"
                                        readOnly={field === "discount"}
                                   />
                              </div>
                         ))}
                    </div>

                    {/* SPECIFICATIONS */}
                    <h2 className="text-xl font-bold mt-6">📌 Specifications</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {Object.keys(initialProductData.specifications).map(key => (
                              <div key={key}>
                                   <label className="block font-medium mb-1">{key.toUpperCase()}</label>
                                   <input
                                        type="text"
                                        name={`spec_${key}`}
                                        value={productData.specifications[key]}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg"
                                   />
                              </div>
                         ))}
                    </div>

                    {/* SUBMIT */}
                    <div className="flex gap-4 pt-4">
                         <button
                              type="submit"
                              className={`w-full text-white p-3 rounded-lg font-bold ${editId ? "bg-green-600" : "bg-blue-600"}`}
                              disabled={loading}
                         >
                              {loading ? "Saving..." : editId ? "Update Product" : "Add Product"}
                         </button>

                         {editId && (
                              <button
                                   type="button"
                                   onClick={cancelEdit}
                                   className="w-1/3 bg-gray-500 text-white p-3 rounded-lg font-bold"
                              >
                                   Cancel
                              </button>
                         )}
                    </div>
               </form>

               {/* PRODUCT LIST */}
               <hr className="my-10" />

               <h2 className="text-2xl font-extrabold mb-4">📦 Existing Products ({products.length})</h2>

               <div className="space-y-4">
                    {products.map((item, i) => (
                         <div
                              key={item._id || i}
                              className={`p-4 border rounded-xl shadow-sm bg-white flex justify-between items-center 
                        ${editId === item._id ? "border-4 border-indigo-400" : ""}`}
                         >
                              <div>
                                   <h3 className="font-bold text-lg">{item.name}</h3>
                                   <p className="text-sm text-gray-600">₹{item.price} | Stock: {item.stock}</p>
                              </div>

                              <div className="flex gap-2">
                                   <button
                                        onClick={() => handleEdit(item)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg"
                                   >
                                        Edit
                                   </button>

                                   <button
                                        onClick={() => handleDelete(item._id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg"
                                   >
                                        Delete
                                   </button>
                              </div>
                         </div>
                    ))}
               </div>
          </div>
     );
};

export default AdminProductsAdd;
