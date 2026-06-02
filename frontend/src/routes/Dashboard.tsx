import { useState, useEffect } from 'react';
import SearchPanel from '../components/SearchPanel';
import ArticleCard from '../components/ArticleCard';
import SentimentPie from '../components/SentimentPie';
import KeywordsBar from '../components/KeywordsBar';
import TrendList from '../components/TrendList';
import { searchNews, getHistory } from '../services/api';

export default function Dashboard() {
  const [articles, setArticles] = useState<any[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [sentiments, setSentiments] = useState({});
  const [keywords, setKeywords] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const doSearch = async (q: any) => {
    setLoading(true);
    try {
      const data = await searchNews(q);
      setArticles(data.articles || []);
      setTrending(data.trending || []);
      setSentiments(data.sentiments || {});
      setKeywords(data.keywords || []);
    } catch (err) {
      alert("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-center">NewsPulse - AI News Analyzer</h1>
      
      <SearchPanel onSearch={doSearch} loading={loading} />

      <div className="row">
        <div className="col-lg-4">
          <TrendList trending={trending} />
          <SentimentPie sentiments={sentiments} />
        </div>
        <div className="col-lg-8">
          <KeywordsBar keywords={keywords} />
          
          {loading && <div className="alert alert-info">Analyzing latest news...</div>}

          <div className="row row-cols-1 row-cols-md-2 g-3">
            {articles.map((a, i) => (
              <div className="col" key={i}>
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="mt-5">
        <h5>Recent Searches</h5>
        <ul className="list-group">
          {history.map((h: any, i) => (
            <li className="list-group-item" key={i}>
              {h.city || ''} {h.category || ''} {h.keyword || ''} - {h.searched_at}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}