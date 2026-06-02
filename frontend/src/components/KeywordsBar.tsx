export default function KeywordsBar({ keywords }: { keywords: any[] }) {
  const highestFreq = keywords.length > 0 ? Math.max(...keywords.map(k => k.frequency)) : 1;
  const colors = ['bg-news-chart1', 'bg-news-chart2', 'bg-news-chart3', 'bg-news-chart4', 'bg-news-chart5'];

  return (
    <div className="bg-news-card p-5 rounded-xl border border-news-border shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-news-lightText mb-4">High-Density Tokens</h3>
      <div className="space-y-3">
        {keywords.length > 0 ? (
          keywords.map((item, idx) => {
            const barWidth = Math.min(100, Math.max(8, (item.frequency / highestFreq) * 100));
            return (
              <div key={idx} className="flex items-center space-x-3 text-xs">
                <div className="w-20 text-news-darkText font-mono truncate font-semibold">{item.keyword}</div>
                <div className="flex-1 bg-news-bg rounded-full h-2 overflow-hidden">
                  <div style={{ width: `${barWidth}%` }} className={`${colors[idx % colors.length]} h-full rounded-full transition-all duration-300`}></div>
                </div>
                <div className="w-6 text-right font-bold text-news-neutral font-mono">{item.frequency}</div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-news-neutral text-center py-2 font-medium">No analytical keywords parsed yet.</div>
        )}
      </div>
    </div>
  );
}