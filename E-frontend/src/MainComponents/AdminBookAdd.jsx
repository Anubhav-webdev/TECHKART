import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

const API_URL = `${API_BASE_URL}/books`;

// INITIAL BOOK DATA
const initialBookData = {
     title: "",
     author: "",
     publisher: "",
     language: "English",
     pages: 0,
     genre: "",
     edition: "",
     isbn: "",
     category: "book",
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

const AdminBookAdd = () => {
     const [bookData, setBookData] = useState(initialBookData);
     const [books, setBooks] = useState([]);
     const [editBookId, setEditBookId] = useState(null);
     const [loading, setLoading] = useState(false);



     // ---------------- FETCH ----------------
     const fetchBooks = async () => {
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
               }));

               setBooks(cleaned);
          } catch (err) {
               console.error("FETCH ERROR:", err);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchBooks();
     }, []);

     // ---------------- INPUT HANDLER ----------------
     const handleChange = e => {
          const { name, value } = e.target;

          // Arrays
          if (["gallery", "offerTags"].includes(name)) {
               setBookData(prev => ({
                    ...prev,
                    [name]: value.split(",").map(v => v.trim()).filter(v => v !== "")
               }));
               return;
          }

          // Numbers
          if (["price", "oldPrice", "discount", "stock", "rating", "pages"].includes(name)) {
               const parsedValue = parseFloat(value);
               setBookData(prev => {
                    const updatedData = {
                         ...prev,
                         [name]: isNaN(parsedValue) ? 0 : parsedValue
                    };

                    // Auto-calculate discount when price or oldPrice changes
                    if (name === "price" || name === "oldPrice") {
                         updatedData.discount = calculateDiscount(updatedData.oldPrice, updatedData.price);
                    }

                    return updatedData;
               });
               return;
          }

          setBookData(prev => ({ ...prev, [name]: value }));
     };

     // ---------------- ADD / UPDATE ----------------
     const handleSubmit = async e => {
          e.preventDefault();
          setLoading(true);

          try {
               if (editBookId) {
                    await axios.put(`${API_URL}/update/${editBookId}`, bookData);
                    alert("Book updated successfully!");

                    setBooks(prev =>
                         prev.map(b => (b._id === editBookId ? { ...b, ...bookData } : b))
                    );

               } else {
                    const res = await axios.post(`${API_URL}/add`, bookData);
                    alert("Book added successfully!");
                    setBooks(prev => [...prev, res.data]);
               }

               setBookData(initialBookData);
               setEditBookId(null);
          } catch (err) {
               console.error("SAVE ERROR:", err.response?.data || err.message);
               alert(`Failed to save. Error: ${err.response?.data?.message || err.message}`);
          } finally {
               setLoading(false);
          }
     };

     // ---------------- DELETE ----------------
     const handleDelete = async id => {
          if (!window.confirm("Delete this book permanently?")) return;

          setLoading(true);
          try {
               await axios.delete(`${API_URL}/delete/${id}`);
               alert("Book deleted!");
               setBooks(prev => prev.filter(b => b._id !== id));

          } catch (err) {
               console.error("DELETE ERROR:", err);
          } finally {
               setLoading(false);
          }
     };

     // ---------------- EDIT ----------------
     const handleEdit = item => {
          setEditBookId(item._id);
          const editData = {
               ...item,
               gallery: item.gallery || [],
               offerTags: item.offerTags || [],
               reviews: item.reviews || [],
          };
          // Recalculate discount to ensure it's accurate
          editData.discount = calculateDiscount(editData.oldPrice, editData.price);
          setBookData(editData);
          window.scrollTo({ top: 0, behavior: "smooth" });
     };

     const handleCancelEdit = () => {
          setEditBookId(null);
          setBookData(initialBookData);
     };

     return (
          <div className="p-6 md:p-10 max-w-4xl mx-auto bg-gray-50 rounded-2xl mt-12 mb-20 shadow-xl text-black">

               <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
                    {editBookId ? "✏️ Update Book" : "📚 Add New Book"}
               </h1>

               {/* ---------------- FORM ---------------- */}
               <form onSubmit={handleSubmit} className="space-y-6">

                    {/* MAIN TEXT FIELDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                         {["title", "author", "publisher", "language", "genre", "edition", "isbn"].map(field => (
                              <div key={field}>
                                   <label className="block text-sm font-medium mb-1">{field.toUpperCase()}</label>
                                   <input
                                        type="text"
                                        name={field}
                                        value={bookData[field]}
                                        onChange={handleChange}
                                        required={["title", "author", "price"].includes(field)}
                                        className="w-full p-3 border rounded-lg shadow-sm"
                                   />
                              </div>
                         ))}

                    </div>

                    {/* Description */}
                    <div>
                         <label className="block text-sm font-medium mb-1">Description</label>
                         <textarea
                              name="description"
                              value={bookData.description}
                              onChange={handleChange}
                              rows="3"
                              className="w-full p-3 border rounded-lg shadow-sm"
                         />
                    </div>

                    {/* IMAGE + GALLERY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                         {["image", "gallery"].map(field => (
                              <div key={field}>
                                   <label className="block text-sm font-medium mb-1">{field.toUpperCase()}</label>
                                   <input
                                        type="text"
                                        name={field}
                                        value={field === "gallery" ? bookData[field].join(", ") : bookData[field]}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-lg shadow-sm"
                                   />
                              </div>
                         ))}

                    </div>

                    {/* NUMBER FIELDS */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                         {["pages", "price", "oldPrice", "discount", "stock", "rating"].map(field => (
                              <div key={field}>
                                   <label className="block text-sm font-medium mb-1">{field.toUpperCase()}</label>
                                   <input
                                        type="number"
                                        name={field}
                                        value={bookData[field]}
                                        onChange={handleChange}
                                        className={`w-full p-3 border rounded-lg shadow-sm ${field === "discount" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                        readOnly={field === "discount"}
                                   />
                              </div>
                         ))}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="flex gap-4 pt-4">
                         <button
                              type="submit"
                              disabled={loading}
                              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow-md"
                         >
                              {editBookId ? "Update Book" : "Add Book"}
                         </button>

                         {editBookId && (
                              <button
                                   type="button"
                                   onClick={handleCancelEdit}
                                   className="w-1/3 bg-gray-500 text-white p-3 rounded-lg font-bold shadow-md"
                              >
                                   Cancel
                              </button>
                         )}
                    </div>
               </form>

               <hr className="my-10" />

               {/* ---------------- LIST ---------------- */}
               <h2 className="text-2xl font-extrabold mt-10 mb-6 text-gray-800">
                    📚 Existing Books ({books.length})
               </h2>

               {!books.length ? (
                    <p>No books added yet.</p>
               ) : (
                    <div className="space-y-4">
                         {books.map((item) => (
                              <div
                                   key={item._id}
                                   className="p-5 border rounded-xl shadow-md flex justify-between items-center bg-white"
                              >
                                   <div>
                                        <h3 className="font-semibold text-lg">{item.title}</h3>
                                        <p className="text-sm text-gray-600">{item.author}</p>
                                        <p className="text-gray-700">₹{item.price} | Stock: {item.stock}</p>
                                   </div>

                                   <div className="flex gap-3">
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
               )}
          </div>
     );
};

export default AdminBookAdd;
