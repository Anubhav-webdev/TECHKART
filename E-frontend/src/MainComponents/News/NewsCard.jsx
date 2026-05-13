export default function NewsCard({ article }) {
  return (
    <div className="
      bg-black rounded-2xl p-5 mb-6 border border-pink-500/40 
      hover:border-pink-400 transition duration-300
    ">
      
      <div className="flex gap-4 max-md:flex-col-reverse">

        {/* IMAGE LEFT */}
        <div className="w-[230px] h-[230px]  flex-shrink-0  overflow-hidden rounded-xl
                        border border-pink-500/30
                        hover:border-pink-400
                        ">
          <img 
            src={article.image || 'https://via.placeholder.com/400'}
            className="w-full h-full object-cover hover:scale-105 transition"
          />
        </div>

        {/* TEXT RIGHT */}
        <div className="flex-1">
          <span className="text-orange-400 font-bold">
            {article.source.name}
          </span>

          <h2 className="text-white font-bold mt-1">{article.title}</h2>
          <p className="text-gray-500 mt-2">
            {article.description || "No description available"}
          </p>

          <a href={article.url} target="_blank" rel="noreferrer"
            className="text-cyan-400 font-semibold inline-block mt-3 hover:underline">
            Read full story →
          </a>
        </div>

      </div>
    </div>
  )
}
