import { useEffect, useState } from "react";
import axios from "axios";
import NewsCard from "./NewsCard";

const REFRESH_TIME = 7200000; // 2 hours

export default function BreakingNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

const loadNews = async () => {
  try {
    setLoading(true);

    const response = await axios.get('https://techkart-ava8.onrender.com/api/news', {
      params: {
        q: "smartphone chip price",
        lang: "en",
        country: "in",
        max: 7
      }
    });

    setNews(response.data.articles || []);
  } catch (error) {
    console.error("Axios news fetch failed:");

    if (error.response) {
      console.log("STATUS:", error.response.status);
      console.log("DATA:", error.response.data);
    } else if (error.request) {
      console.log("NO RESPONSE RECEIVED");
    } else {
      console.log("ERROR", error.message);
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, REFRESH_TIME);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-8xl mx-auto md:p-4 p-6">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center px-5 py-3 rounded-xl shadow-lg mt-20">
          <h1 className="text-xl font-bold">🔴 Live Tech News</h1>

          <span className="bg-red-700 px-3 py-1 rounded-md font-bold animate-pulse">
            LIVE
          </span>
        </div>

        {/* BREAKING TICKER */}
        <div className="bg-red-700 mt-4 overflow-hidden rounded-md">
          <div className="whitespace-nowrap px-4 py-2 animate-marquee font-semibold">
            BREAKING NEWS • MEMORY CHIP SHORTAGE • SMARTPHONE PRICES MAY RISE • AI DEMAND SURGE •
          </div>
        </div>

        {/* NEWS GRID */}
        <div className="mt-6">
          {loading ? (
            <p className="text-center text-gray-400">Loading live news...</p>
          ) : news.length === 0 ? (
            <p className="text-center text-red-400">No news available</p>
          ) : (
            <div
              className="
                grid gap-8
                grid-cols-1
                lg:grid-cols-2
                place-items-center
                animate-[fadeIn_.6s_ease-out]
              "
            >
              {news.map((article, index) => (
                <div className="w-full" key={index}>
                  <NewsCard article={article} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="h-16 flex items-center justify-center text-gray-500 italic mt-8">
         more news coming soon...
        </div>
      </div>
    </div>
  );
}
