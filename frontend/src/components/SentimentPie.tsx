import { Smile, Meh, Frown, BarChart3 } from 'lucide-react';

export default function SentimentPie({ sentiments }: { sentiments: any }) {
  const total = (sentiments.Positive || 0) + (sentiments.Neutral || 0) + (sentiments.Negative || 0) || 1;
  const posPct = Math.round(((sentiments.Positive || 0) / total) * 100);
  const neuPct = Math.round(((sentiments.Neutral || 0) / total) * 100);
  const negPct = Math.round(((sentiments.Negative || 0) / total) * 100);

  return (
    <div className="bg-news-card p-5 rounded-xl border border-news-border shadow-sm">
      <div className="flex items-center space-x-2 text-news-lightText mb-4">
        <BarChart3 size={16} className="text-news-neutral" />
        <h3 className="text-xs font-bold uppercase tracking-wider">News Insights (Sentiment)</h3>
      </div>
      
      {/* Visual Percentage Distribution Progress Bar */}
      <div className="h-2.5 w-full rounded-full flex overflow-hidden bg-news-bg mb-5 border border-news-bg">
        <div style={{ width: `${posPct}%` }} className="bg-news-chart4 h-full transition-all duration-500"></div>
        <div style={{ width: `${neuPct}%` }} className="bg-news-chart3 h-full transition-all duration-500"></div>
        <div style={{ width: `${negPct}%` }} className="bg-news-chart5 h-full transition-all duration-500"></div>
      </div>
      
      {/* Premium Lucide Balanced Icon Rows */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        <div className="text-emerald-600 flex flex-col items-center gap-1">
          <Smile size={16} />
          <span>Pos: {posPct}%</span>
        </div>
        <div className="text-slate-500 flex flex-col items-center gap-1">
          <Meh size={16} />
          <span>Neu: {neuPct}%</span>
        </div>
        <div className="text-rose-600 flex flex-col items-center gap-1">
          <Frown size={16} />
          <span>Neg: {negPct}%</span>
        </div>
      </div>
    </div>
  );
}