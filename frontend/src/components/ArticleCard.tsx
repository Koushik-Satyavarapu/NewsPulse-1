import { useState } from 'react';
import { MessageSquare, Bookmark, ExternalLink, ShieldAlert } from 'lucide-react';

interface ArticleCardProps {
  article: { 
    title: string; 
    description: string; 
    url: string; 
    publishedAt: string; 
    source: string; 
    sentiment: "Positive" | "Neutral" | "Negative"; 
    image?: string; 
  };
  onBookmark: (a: any) => void;
  isBookmarked: boolean;
}

export default function ArticleCard({ article, onBookmark, isBookmarked }: ArticleCardProps) {
  const [showDiscuss, setShowDiscuss] = useState(false);
  
  const [chat, setChat] = useState<{ role: 'assistant' | 'user'; text: string }[]>([
    { 
      role: 'assistant', 
      text: 'Telemetry linked. Would you like an extraction summary of this node?' 
    }
  ]);
  const [input, setInput] = useState('');

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
    <div className="
      bg-news-card
      rounded-2xl
      border
      border-news-border
      p-5
      shadow-sm
      hover:shadow-lg
      transition-all
      duration-300
      flex
      flex-col
      justify-between
      min-w-0
      hover:border-news-primary/30
    ">

      {/* TOP META SECTION */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`inline-flex items-center space-x-1.5 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${activeStyle.badge}`}>
          {article.sentiment === 'Negative' ? (
            <ShieldAlert size={10} className="text-rose-500" />
          ) : (
            <span className={`h-1.5 w-1.5 rounded-full ${activeStyle.dot}`} />
          )}
          <span>{article.sentiment}</span>
        </span>

        <span className="text-xs font-bold text-news-darkText truncate">
          {article.source || "General News"}
        </span>

        <span className="text-news-border text-xs font-mono">•</span>

        <span className="text-xs text-news-lightText font-mono truncate">
          {article.publishedAt}
        </span>
      </div>

      {/* ARTICLE CONTENT */}
      <div className="space-y-3">
        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="
            block
            font-bold
            text-lg
            text-news-darkText
            hover:text-news-primary
            transition-colors
            leading-snug
            line-clamp-2
          "
        >
          {article.title}
        </a>

        <p className="
          text-sm
          text-news-lightText
          leading-relaxed
          line-clamp-3
        ">
          {article.description || "Context summary unavailable."}
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="
        flex
        flex-wrap
        items-center
        gap-3
        pt-4
        mt-5
        border-t
        border-news-border
      ">
        <button
          onClick={() => onBookmark(article)}
          className={`
            flex
            items-center
            gap-2
            px-3
            py-2
            rounded-xl
            border
            text-sm
            font-semibold
            transition-all
            min-h-[42px]
            ${isBookmarked
              ? 'bg-news-primary/10 border-news-primary text-news-primary'
              : 'border-news-border text-news-lightText hover:bg-news-bg'}
          `}
        >
          <Bookmark
            size={15}
            className={isBookmarked ? "fill-news-primary" : ""}
          />
          <span>
            {isBookmarked ? 'Saved' : 'Save'}
          </span>
        </button>

        <button
          onClick={() => setShowDiscuss(!showDiscuss)}
          className={`
            flex
            items-center
            gap-2
            px-3
            py-2
            rounded-xl
            border
            text-sm
            font-semibold
            transition-all
            min-h-[42px]
            ${showDiscuss
              ? 'bg-news-primary/5 border-news-primary/30 text-news-primary'
              : 'border-news-border text-news-lightText hover:bg-news-bg'}
          `}
        >
          <MessageSquare size={15} />
          <span>Discuss</span>
        </button>

        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="
            flex
            items-center
            gap-1
            text-news-primary
            sm:ml-auto
            hover:text-news-primaryHover
            font-bold
            text-sm
          "
        >
          <span>Open Link</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* DISCUSSION PANEL */}
      {showDiscuss && (
        <div className="
          bg-news-bg
          p-4
          border
          border-news-border
          rounded-xl
          space-y-3
          mt-4
          animate-fade-in
        ">
          <div className="
            space-y-2
            max-h-40
            overflow-y-auto
            p-2
            bg-news-card
            border
            border-news-border
            rounded-lg
            text-xs
          ">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`
                  p-2
                  rounded-lg
                  leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-news-primary/10 text-news-darkText ml-6'
                    : 'bg-news-bg text-news-lightText mr-6'}
                `}
              >
                <strong>
                  {msg.role === 'user' ? 'You' : 'System'}:
                </strong>{' '}
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="
                flex-1
                px-3
                py-2
                border
                border-news-border
                bg-news-card
                rounded-lg
                outline-none
                text-sm
                text-news-darkText
                focus:border-news-primary
              "
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  document.getElementById('card-chat-send-btn')?.click();
                }
              }}
            />

            <button
              id="card-chat-send-btn"
              onClick={() => {
                if (!input.trim()) return;

                setChat(prev => [
                  ...prev,
                  { role: 'user', text: input },
                  {
                    role: 'assistant',
                    text: `Analyzing keyword distribution mapping for "${input}".`
                  }
                ]);

                setInput('');
              }}
              className="
                px-4
                bg-news-primary
                text-white
                text-sm
                font-bold
                rounded-lg
                hover:bg-news-primaryHover
                transition-colors
              "
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}