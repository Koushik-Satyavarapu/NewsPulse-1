import { useState } from 'react';
import { MessageSquare, Bookmark, ExternalLink, ShieldAlert } from 'lucide-react';

interface ArticleCardProps {
  article: { title: string; description: string; url: string; publishedAt: string; source: string; sentiment: "Positive" | "Neutral" | "Negative"; };
  onBookmark: (a: any) => void;
  isBookmarked: boolean;
}

export default function ArticleCard({ article, onBookmark, isBookmarked }: ArticleCardProps) {
  const [showDiscuss, setShowDiscuss] = useState(false);
  const [chat, setChat] = useState([{ role: 'assistant', text: 'Telemetry linked. Would you like an extraction summary of this node?' }]);
  const [input, setInput] = useState('');

  // Professional color styling tokens for solid state badges
  const sentimentStyles = {
    Positive: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500"
    },
    Neutral: {
      badge: "bg-slate-50 text-slate-700 border-slate-200",
      dot: "bg-slate-400"
    },
    Negative: {
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500"
    }
  };

  const activeStyle = sentimentStyles[article.sentiment] || sentimentStyles.Neutral;

  return (
    <div className="bg-news-card rounded-xl border border-news-border overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-4 sm:p-5 flex flex-col gap-2">
        
        {/* UNIFORM BADGE MATRIX ROW */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`inline-flex items-center space-x-1.5 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${activeStyle.badge}`}>
            {article.sentiment === 'Negative' ? (
              <ShieldAlert size={10} className="text-rose-500" />
            ) : (
              <span className={`h-1.5 w-1.5 rounded-full ${activeStyle.dot}`} />
            )}
            <span>{article.sentiment}</span>
          </span>
          <span className="text-xs font-bold text-news-darkText">{article.source || "General News"}</span>
          <span className="text-news-border text-xs font-mono">•</span>
          <span className="text-xs text-news-lightText font-mono">{article.publishedAt}</span>
        </div>
        
        {/* TYPOGRAPHY BLOCKS */}
        <a href={article.url} target="_blank" rel="noreferrer" className="block font-bold text-sm sm:text-base text-news-darkText hover:text-news-primary transition-colors line-clamp-2">{article.title}</a>
        <p className="text-xs text-news-lightText line-clamp-2 leading-relaxed mb-2">{article.description || "Context summary missing from feed parameters."}</p>
        
        {/* ACTION BUTTON CONTROLS ROW */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-news-bg text-xs font-semibold">
          <button 
            onClick={() => onBookmark(article)} 
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border transition-colors ${isBookmarked ? 'bg-news-primary/10 border-news-primary text-news-primary' : 'border-news-border text-news-lightText hover:bg-news-bg'}`}
          >
            <Bookmark size={14} className={isBookmarked ? "fill-news-primary" : ""} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
          
          <button 
            onClick={() => setShowDiscuss(!showDiscuss)} 
            className="flex items-center space-x-1.5 border border-news-border text-news-lightText px-2.5 py-1 rounded hover:bg-news-bg transition-colors"
          >
            <MessageSquare size={14} />
            <span>Discuss</span>
          </button>
          
          <a href={article.url} target="_blank" rel="noreferrer" className="flex items-center space-x-1 text-news-primary ml-auto hover:text-news-primaryHover font-bold">
            <span>Open Link</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
      
      {/* DISCUSSION BLOCK PANEL */}
      {showDiscuss && (
        <div className="bg-news-bg p-4 border-t border-news-border space-y-3">
          <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-news-card border border-news-border rounded-lg text-xs">
            {chat.map((msg, i) => (
              <div key={i} className={`p-2 rounded-lg leading-relaxed ${msg.role === 'user' ? 'bg-news-primary/10 text-news-darkText ml-8' : 'bg-news-bg text-news-lightText mr-8'}`}>
                <strong>{msg.role === 'user' ? 'You' : 'System'}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question..." className="flex-1 px-3 py-1.5 border border-news-border bg-news-card rounded-md outline-none text-xs text-news-darkText focus:border-news-primary" />
            <button onClick={() => { if(!input.trim()) return; setChat([...chat, { role: 'user', text: input }, { role: 'assistant', text: `Analyzing keyword distribution mapping for "${input}".` }]); setInput(''); }} className="px-3 bg-news-primary text-white text-xs font-bold rounded-md hover:bg-news-primaryHover">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}