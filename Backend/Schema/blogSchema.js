import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
     image: {
          type: String,
          required: false,
     },
     category: {
          type: String,
          required: true,
          trim: true,
     },
     date: {
          type: String,
          required: false,
     },
     title: {
          type: String,
          required: true,
          trim: true,
     },
     excerpt: {
          type: String,
          required: true,
          trim: true,
     },
     author: {
          type: String,
          default: "Unknown",
     },
     readTime: {
          type: Number,
          default: 0,
     },
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
export { blogSchema };