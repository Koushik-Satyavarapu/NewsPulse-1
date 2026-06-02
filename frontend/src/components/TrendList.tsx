export default function TrendList({ trending }: { trending: string[] }) {
  return (
    <div className="bg-news-card p-5 rounded-xl border border-news-border shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-news-lightText mb-3.5">Contextual Vectors</h3>
      <div className="flex flex-wrap gap-1.5">
        {trending.length > 0 ? (
          trending.map((trend, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-md font-medium border border-news-border bg-news-bg text-news-darkText">
              # {trend}
            </span>
          ))
        ) : (
          <span className="text-xs text-news-neutral font-mono">No data tags registered.</span>
        )}
      </div>
    </div>
  );
}