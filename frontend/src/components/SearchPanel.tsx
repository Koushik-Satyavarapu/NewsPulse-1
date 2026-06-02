import { useState, useEffect } from 'react';

const CATEGORIES = ["Politics","Technology","Business","Health","Sports","Entertainment","Science","World"];

interface SearchPanelProps {
  onSearch: (q: any) => void;
  loading: boolean;
  defaultKeyword?: string;
}

export default function SearchPanel({ onSearch, loading, defaultKeyword = '' }: SearchPanelProps) {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState(defaultKeyword);

  useEffect(() => {
    if (defaultKeyword) setKeyword(defaultKeyword);
  }, [defaultKeyword]);

  return (
    <div className="p-6 rounded-xl border border-news-border bg-news-card shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-3">
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-news-lightText">Target Region</label>
          <input className="w-full px-3 py-2 text-sm rounded-lg border border-news-border outline-none bg-news-bg text-news-darkText focus:border-news-primary focus:bg-news-card transition-colors" placeholder="e.g., Hyderabad" value={city} onChange={e => setCity(e.target.value)} />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-news-lightText">Category Filter</label>
          <select className="w-full px-3 py-2 text-sm rounded-lg border border-news-border outline-none bg-news-bg text-news-darkText focus:border-news-primary focus:bg-news-card transition-colors" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Global Feeds (All)</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-news-lightText">Contextual Keyword</label>
          <input className="w-full px-3 py-2 text-sm rounded-lg border border-news-border outline-none bg-news-bg text-news-darkText focus:border-news-primary focus:bg-news-card transition-colors" placeholder="Search matching phrase..." value={keyword} onChange={e => setKeyword(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <button onClick={() => onSearch({city, category, keyword})} disabled={loading} className="w-full bg-news-primary hover:bg-news-primaryHover disabled:bg-news-neutral text-white font-semibold text-sm py-2 px-4 rounded-lg shadow transition-colors">
            {loading ? "Scanning..." : "Execute Scan"}
          </button>
        </div>
      </div>
    </div>
  );
}