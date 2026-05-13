import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:7000/api/blogs";

const initialBlogData = {
     image: "",
     category: "",
     date: "",
     title: "",
     excerpt: "",
     author: "",
     readTime: "",
};

const AdminBlogAdd = () => {
     const [blogData, setBlogData] = useState(initialBlogData);
     const [blogs, setBlogs] = useState([]);
     const [editBlogId, setEditBlogId] = useState(null); // Track which blog is being edited
     const [loading, setLoading] = useState(false); // New loading state for all API calls

     // ---------------------------- FETCH BLOGS ----------------------------
     const fetchBlogs = async () => {
          setLoading(true);
          try {
               const res = await axios.get(API_URL);
               setBlogs(res.data);
          } catch (err) {
               console.error("FETCH ERROR:", err);
               // Optionally show error message
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchBlogs();
     }, []);

     // ---------------------------- HANDLE INPUT ----------------------------
     const handleChange = (e) => {
          const { name, value } = e.target;
          setBlogData(prev => ({
               ...prev,
               [name]: name === "readTime" ? parseInt(value) || "" : value, // Ensure readTime is a number or empty string
          }));
     };

     // ---------------------------- ADD / UPDATE BLOG ----------------------------
     const handleSubmit = async (e) => {
          e.preventDefault();
          setLoading(true);

          try {
               if (editBlogId) {
                    // Update existing blog
                    await axios.put(`${API_URL}/update/${editBlogId}`, blogData);
                    alert("Blog updated successfully! 🚀");
               } else {
                    // Add new blog
                    await axios.post(`${API_URL}/add`, blogData);
                    alert("Blog added successfully! 🎉");
               }

               // Reset form
               setBlogData(initialBlogData);
               setEditBlogId(null);

               fetchBlogs(); // Refresh list to show updates
          } catch (err) {
               console.error("SAVE ERROR:", err.response ? err.response.data : err.message);
               alert(`Failed to save blog. Error: ${err.response?.data?.message || err.message}`);
          } finally {
               setLoading(false);
          }
     };

     // ---------------------------- DELETE BLOG ----------------------------
     const handleDelete = async (id) => {
          if (!window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) return;
          setLoading(true);

          try {
               await axios.delete(`${API_URL}/delete/${id}`);
               alert("Deleted successfully! 🗑️");
               setBlogs(prev => prev.filter(b => b._id !== id)); // Optimistic update
          } catch (err) {
               console.error("DELETE ERROR:", err);
               alert("Failed to delete blog.");
          } finally {
               setLoading(false);
          }
     };

     // ---------------------------- EDIT BLOG ----------------------------
     const handleEdit = (blog) => {
          setEditBlogId(blog._id);
          // Ensure readTime is displayed correctly (can be string or number)
          setBlogData({
               ...blog,
               readTime: blog.readTime ? String(blog.readTime) : "",
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
     };

     // ---------------------------- CANCEL EDIT ----------------------------
     const handleCancelEdit = () => {
          setEditBlogId(null);
          setBlogData(initialBlogData);
     };

     // Helper functions for dynamic text/classes
     const getLabel = (field) => {
          const map = {
               image: "Main Image URL",
               category: "Category (e.g., Tech, Fashion, Food)",
               date: "Publish Date",
               title: "Blog Title",
               excerpt: "Short Excerpt/Summary",
               author: "Author Name",
               readTime: "Estimated Read Time (minutes)",
          };
          return map[field] || field.charAt(0).toUpperCase() + field.slice(1);
     }

     const submitButtonText = editBlogId ? "Update Blog" : "Add Blog";
     const submitButtonClass = editBlogId
          ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
          : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";


     return (
          <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 rounded-2xl mt-12 mb-20 shadow-2xl transition-all duration-500 text-black">
               {/* ---------------- Add / Update Blog Form ---------------- */}
               <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800 border-b pb-4">
                    {editBlogId ? "✏️ Update Blog Post" : "✍️ Add New Blog Post"}
               </h1>

               <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Image, Category, Date, Author, Read Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {["image", "category", "date", "author", "readTime"].map((field) => (
                              <div key={field}>
                                   <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">{getLabel(field)}</label>
                                   <input
                                        id={field}
                                        type={field === "date" ? "date" : field === "readTime" ? "number" : "text"}
                                        name={field}
                                        value={blogData[field]}
                                        onChange={handleChange}
                                        placeholder={field === "readTime" ? "e.g., 5" : ""}
                                        required={field !== "image"}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                                   />
                              </div>
                         ))}
                    </div>

                    {/* Title */}
                    <div>
                         <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">{getLabel("title")}</label>
                         <input
                              id="title"
                              type="text"
                              name="title"
                              value={blogData.title}
                              onChange={handleChange}
                              placeholder="A catchy title for your blog post..."
                              required
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                         />
                    </div>

                    {/* Excerpt */}
                    <div>
                         <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">{getLabel("excerpt")}</label>
                         <textarea
                              id="excerpt"
                              name="excerpt"
                              value={blogData.excerpt}
                              onChange={handleChange}
                              placeholder="Write a short summary or teaser (max 2-3 sentences)."
                              rows="3"
                              required
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm resize-none"
                         />
                    </div>

                    {/* Submit and Cancel buttons */}
                    <div className="flex gap-4 pt-4">
                         <button
                              type="submit"
                              disabled={loading}
                              className={`w-full text-white p-3 rounded-lg font-bold shadow-md transform hover:scale-[1.01] transition duration-300 ease-in-out ${submitButtonClass} focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed`}
                         >
                              {loading ? (editBlogId ? "Updating..." : "Adding...") : submitButtonText}
                         </button>
                         {editBlogId && (
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

               {/* ---------------- Blog List ---------------- */}
               <h2 className="text-2xl font-extrabold mt-10 mb-6 text-gray-800">📋 Existing Blogs ({blogs.length})</h2>

               {loading && blogs.length === 0 ? (
                    <div className="text-center p-8 text-lg text-gray-600">Loading Blogs...</div>
               ) : blogs.length === 0 ? (
                    <div className="text-center p-8 text-lg text-gray-600">No blog posts added yet.</div>
               ) : (
                    <div className="space-y-4">
                         {blogs.map((b) => (
                              <div
                                   key={b._id}
                                   className={`p-5 border border-gray-200 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center bg-white hover:shadow-lg transition duration-300 ease-in-out transform hover:translate-y-[-2px] ${editBlogId === b._id ? 'border-4 border-indigo-400 ring-2 ring-indigo-500' : ''}`}
                              >
                                   <div className="mb-3 md:mb-0 md:mr-4 flex-grow">
                                        <h3 className="font-semibold text-lg text-gray-900">{b.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                             <span className="font-medium text-indigo-600">{b.category}</span> | {b.date} | By: {b.author}
                                        </p>
                                   </div>

                                   <div className="flex gap-3">
                                        <button
                                             onClick={() => handleEdit(b)}
                                             className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium shadow-sm transition duration-150 ease-in-out transform hover:scale-[1.05]"
                                        >
                                             Edit
                                        </button>

                                        <button
                                             onClick={() => handleDelete(b._id)}
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

export default AdminBlogAdd;