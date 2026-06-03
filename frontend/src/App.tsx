import { useState, useEffect, ReactNode } from 'react';
import { 
  Home, 
  Search, 
  Bookmark, 
  User, 
  Settings, 
  LogOut, 
  Activity, 
  Newspaper, 
  FolderOpen, 
  Menu, 
  X
} from 'lucide-react';
import SearchPanel from './components/SearchPanel';
import TrendList from './components/TrendList';
import SentimentPie from './components/SentimentPie';
import KeywordsBar from './components/KeywordsBar';
import ArticleCard from './components/ArticleCard';
import { 
  searchNews, loginUser, registerUser, getProfile, 
  updateProfile, getPreferences, updatePreferences, 
  getBookmarks, saveBookmark, removeBookmark, getHistory
} from './services/api';

type Page = 'home' | 'search' | 'bookmarks' | 'profile' | 'preferences';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  onRedirect: () => void;
  children: ReactNode;
}

function ProtectedRoute({ isAuthenticated, onRedirect, children }: ProtectedRouteProps) {
  useEffect(() => {
    if (!isAuthenticated) {
      alert("Access Denied: Please log in to your account first.");
      onRedirect();
    }
  }, [isAuthenticated, onRedirect]);

  if (!isAuthenticated) {
    return (
      <div className="bg-news-card p-6 border border-news-border rounded-xl shadow-sm text-center m-4">
        <p className="text-sm font-semibold text-news-negative">Authenticating user validation token...</p>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [articles, setArticles] = useState<any[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [sentiments, setSentiments] = useState({ Positive: 0, Neutral: 0, Negative: 0 });
  const [keywords, setKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("news_pulse_session"));
  const [username, setUsername] = useState(localStorage.getItem("news_pulse_user") || "Guest Analyst");
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [profileData, setProfileData] = useState({ 
    username: localStorage.getItem("news_pulse_user") || '', 
    bio: '', 
    email: '' 
  });
  const [prefCategories, setPrefCategories] = useState<string[]>([]);
  const [prefKeywords, setPrefKeywords] = useState('');
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      syncUserData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentPage === 'home' && isAuthenticated) {
      getHistory().then(data => setSearchHistory(data || [])).catch(err => console.error(err));
    }
    setIsSidebarOpen(false);
  }, [currentPage]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  const syncUserData = async () => {
    try {
      const bData = await getBookmarks();
      setBookmarks(bData);
      
      const pData = await getProfile();
      setProfileData({
        username: pData.username || '',
        bio: pData.bio || '',
        email: pData.email || ''
      });
      
      const prData = await getPreferences();
      setPrefCategories(prData.categories || []);
      setPrefKeywords(prData.keywords || '');
    } catch (err) {
      console.error("Session sync error context:", err);
    }
  };

  const handleAuthAction = async () => {
    if (!emailInput || !passwordInput || (authTab === 'register' && !usernameInput)) {
      alert("Please complete all input blocks.");
      return;
    }
    try {
      let res = authTab === 'login' 
        ? await loginUser({ email: emailInput, password: passwordInput })
        : await registerUser({ username: usernameInput, email: emailInput, password: passwordInput });
      localStorage.setItem("news_pulse_session", res.session_token);
      localStorage.setItem("news_pulse_user", res.username);
      setUsername(res.username);
      setIsAuthenticated(true);
      setCurrentPage('home');
    } catch (err: any) {
      alert(err.response?.data?.detail || "Authentication layer handshake failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("news_pulse_session");
    localStorage.removeItem("news_pulse_user");
    setIsAuthenticated(false);
    setCurrentPage('home');
    setArticles([]);
    setBookmarks([]);
    setSearchHistory([]);
    setIsSidebarOpen(false);
  };

  const handleSearch = async (query: any) => {
    setLoading(true);
    try {
      const data = await searchNews(query);
      setArticles(data.articles || []);
      setTrending(data.trending || []);
      setSentiments(data.sentiments || { Positive: 0, Neutral: 0, Negative: 0 });
      setKeywords(data.keywords || []);
    } catch (error) {
      console.error(error);
      alert("Failed to sync structural news telemetry.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (article: any) => {
    if (!isAuthenticated) {
      alert("Please register or log in to manage bookmarks.");
      return;
    }
    const isSaved = bookmarks.some(b => b.url === article.url);
    try {
      if (isSaved) {
        await removeBookmark(article.url);
        setBookmarks(bookmarks.filter(b => b.url !== article.url));
      } else {
        await saveBookmark(article);
        setBookmarks([...bookmarks, { ...article, saved_at: new Date().toISOString() }]);
      }
    } catch (err) {
      alert("Bookmark mapping database mutation rejected.");
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.email) {
      alert("Please provide a valid email address before saving updates.");
      return;
    }
    try {
      await updateProfile({
        username: profileData.username,
        bio: profileData.bio,
        email: profileData.email
      });
      
      localStorage.setItem("news_pulse_user", profileData.username);
      setUsername(profileData.username);
      alert("Profile identity securely overwritten.");
    } catch (err: any) {
      console.error("Profile saving vector trace:", err);
      const serverMessage = err.response?.data?.detail;
      alert(serverMessage ? `Server Rejected: ${JSON.stringify(serverMessage)}` : "Unable to write identity updates to cluster.");
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updatePreferences({ categories: prefCategories, keywords: prefKeywords });
      alert("SaaS tracking profile successfully cached.");
    } catch (err) {
      alert("Unable to write parameters onto document.");
    }
  };

  const toggleCategoryPreference = (cat: string) => {
    if (prefCategories.includes(cat)) {
      setPrefCategories(prefCategories.filter(c => c !== cat));
    } else {
      setPrefCategories([...prefCategories, cat]);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-news-bg px-4 py-8">
        <div className="bg-news-card rounded-xl border border-news-border shadow-xl max-w-md sm:max-w-lg w-full p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-news-primary/10 text-news-primary rounded-xl mb-2">
              <Newspaper size={32} />
            </div>
            <h2 className="text-2xl font-bold text-news-primary mt-1">News Pulse</h2>
          </div>
          <div className="flex border-b border-news-border mb-6">
            <button onClick={() => setAuthTab('login')} className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${authTab === 'login' ? 'border-news-primary text-news-primary' : 'border-transparent text-news-lightText'}`}>Login</button>
            <button onClick={() => setAuthTab('register')} className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${authTab === 'register' ? 'border-news-primary text-news-primary' : 'border-transparent text-news-lightText'}`}>Create Account</button>
          </div>
          <div className="space-y-4">
            {authTab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-news-darkText uppercase mb-1">Username Handle</label>
                <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} placeholder="analyst_01" className="w-full px-3 py-2 border border-news-border rounded-lg bg-news-bg text-sm text-news-darkText outline-none" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-news-darkText uppercase mb-1">Email Address</label>
              <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="name@domain.com" className="w-full px-3 py-2 border border-news-border rounded-lg bg-news-bg text-sm text-news-darkText outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-news-darkText uppercase mb-1">Account Secret Password</label>
              <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 border border-news-border rounded-lg bg-news-bg text-sm text-news-darkText outline-none" />
            </div>
            <button onClick={handleAuthAction} className="w-full bg-news-primary text-white text-sm font-semibold py-2.5 rounded-lg shadow-md hover:bg-news-primaryHover transition-colors mt-2">
              {authTab === 'login' ? 'Sign In Engine' : 'Compile Architecture'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-news-bg text-news-darkText antialiased overflow-x-hidden">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* FIXED ASIDE CLASS: COMPACT FLOATING HOVER INTERACTION LAYOUT */}
      <aside className={`
        bg-news-sidebarBg
        flex
        flex-col
        fixed
        lg:sticky
        h-dvh
        top-0
        left-0
        z-50
        text-slate-300
        transform
        transition-all
        duration-300
        ease-in-out
        overflow-hidden
        w-64
        lg:w-20
        lg:hover:w-64
        group
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="text-news-sidebarActive flex-shrink-0">
              <Newspaper size={24} />
            </div>
            {/* FIXED TITLE VISIBILITY WRAPPER */}
            <span className="
              font-bold 
              text-lg 
              text-white 
              tracking-tight 
              truncate
              lg:opacity-0
              lg:group-hover:opacity-100
              transition-opacity
              duration-200
            ">
              News Pulse
            </span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white lg:hidden p-1 rounded-md hover:bg-slate-800 outline-none">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center space-x-2.5 min-w-0">
          <div className="text-slate-400 flex-shrink-0 pl-1">
            <User size={16} />
          </div>
          <div className="min-w-0 flex-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-[10px] text-news-neutral font-bold uppercase tracking-wider leading-none">Analyst Session</p>
            <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">{username}</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {([
            { id: 'home', label: 'Home Portal', icon: <Home size={18} /> },
            { id: 'search', label: 'Search Framework', icon: <Search size={18} /> },
            { id: 'bookmarks', label: 'Saved Bookmarks', icon: <Bookmark size={18} /> },
            { id: 'profile', label: 'User Profile', icon: <User size={18} /> },
            { id: 'preferences', label: 'Preferences', icon: <Settings size={18} /> }
          ] as const).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentPage === item.id ? 'bg-news-sidebarActive text-white shadow-lg shadow-news-sidebarActive/20 font-semibold' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
            >
              <div className="flex-shrink-0 pl-0.5">{item.icon}</div>
              {/* FIXED LABEL OPACITY TRUNCATION WRAPPER */}
              <span className="
                truncate
                lg:opacity-0
                lg:group-hover:opacity-100
                transition-opacity
                duration-200
              ">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-news-negative hover:bg-red-950/20 rounded-lg transition-colors">
            <div className="flex-shrink-0 pl-0.5"><LogOut size={18} /></div>
            <span className="
              truncate
              lg:opacity-0
              lg:group-hover:opacity-100
              transition-opacity
              duration-200
            ">
              Terminate Session
            </span>
          </button>
        </div>
      </aside>

      {/* FIXED MAIN WRAPPER COMPONENT REGION TRANSITION LAYER */}
      <div className="
        flex-1
        flex
        flex-col
        min-h-screen
        min-w-0
        w-full
        transition-all
        duration-300
      ">
        
        <header className="h-16 bg-news-headerBg border-b border-news-border flex items-center px-4 sm:px-8 justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 rounded-lg border border-news-border bg-news-bg lg:hidden text-news-lightText focus:bg-news-card hover:text-news-darkText outline-none">
              <Menu size={18} />
            </button>
            <h2 className="font-bold text-base sm:text-lg text-news-darkText capitalize tracking-tight truncate max-w-[140px] sm:max-w-[220px] md:max-w-none">
              {currentPage} Dashboard
            </h2>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="h-2 w-2 rounded-full bg-news-success animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-mono font-semibold text-news-neutral tracking-tight">Streaming Active</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto min-w-0">
          {currentPage === 'home' && (
            <div className="space-y-6 sm:space-y-8">
              <div>
                <div className="mb-3 flex items-center space-x-2">
                  <div className="text-news-neutral">
                    <Activity size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-news-darkText uppercase tracking-wider">Recent Activity Logs</h3>
                </div>
                <div className="bg-news-card rounded-xl border border-news-border p-4 shadow-sm">
                  {searchHistory.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.slice(0, 6).map((log, idx) => (
                        <div key={log._id || log.id || idx} className="bg-news-bg text-news-darkText px-2.5 py-1.5 rounded-lg border border-news-border text-xs flex items-center space-x-2 max-w-full truncate font-medium">
                          <div className="text-news-neutral flex-shrink-0">
                            <FolderOpen size={12} />
                          </div>
                          <span className="truncate">
                            {[log.keyword, log.category, log.city].filter(Boolean).join(" ➔ ") || "General Feeds Scan"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-news-neutral font-medium py-1">No previous search queries logged to database.</p>
                  )}
                </div>
              </div>

              <hr className="border-news-border" />

              <div>
                <div className="mb-4 flex items-center space-x-2">
                  <div className="text-news-neutral">
                    <Newspaper size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-news-darkText uppercase tracking-wider">Latest Picks</h3>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {articles.length > 0 ? (
                    articles.slice(0, 5).map((art, idx) => (
                      <ArticleCard key={art.url || idx} article={art} onBookmark={handleBookmarkToggle} isBookmarked={bookmarks.some(b => b.url === art.url)} />
                    ))
                  ) : (
                    <div className="col-span-full bg-news-card p-8 sm:p-12 text-center border border-news-border rounded-xl text-news-lightText text-xs font-medium">
                      No search indices loaded in current workspace memory. Head to the <strong>Search Framework</strong> tab to execute data extractions.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentPage === 'search' && (
            <div className="space-y-6 will-change-transform">
              <SearchPanel onSearch={handleSearch} loading={loading} defaultKeyword={prefKeywords} />
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-news-primary mx-auto mb-3"></div>
                  <p className="text-sm text-news-lightText font-medium">Extracting clusters and mapping target records...</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-news-neutral px-1">Streaming Feeds</h3>
                  {articles.slice(0, 12).map((art, idx) => (
                    <ArticleCard key={art.url || idx} article={art} onBookmark={handleBookmarkToggle} isBookmarked={bookmarks.some(b => b.url === art.url)} />
                  ))}
                  {!loading && articles.length === 0 && (
                    <div className="bg-news-card p-8 sm:p-12 text-center border border-news-border rounded-xl text-news-lightText text-sm">
                      No metrics initialized. Execute an API query selection array above.
                    </div>
                  )}
                </div>
                
                <div className="space-y-6 lg:sticky lg:top-24 order-1 lg:order-2">
                  <SentimentPie sentiments={sentiments} />
                  <TrendList trending={trending} />
                  <KeywordsBar keywords={keywords} />
                </div>
              </div>
            </div>
          )}

          {currentPage === 'bookmarks' && (
            <ProtectedRoute isAuthenticated={isAuthenticated} onRedirect={() => setIsAuthenticated(false)}>
              <div>
                <h3 className="text-base font-bold text-news-darkText uppercase tracking-wider mb-4">Saved Bookmarks</h3>
                {bookmarks.length === 0 ? (
                  <div className="bg-news-card p-8 border border-news-border rounded-xl text-center text-news-lightText text-sm">No bookmarks saved in active user documentation node.</div>
                ) : (
                  <div className="space-y-4">
                    {bookmarks.map((art, idx) => (
                      <div key={art.url || art._id || idx} className="bg-news-card p-4 sm:p-5 border border-news-border rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="min-w-0 flex-1 w-full">
                          <a href={art.url} target="_blank" rel="noreferrer" className="font-bold text-news-darkText text-sm sm:text-base hover:text-news-primary block truncate">{art.title}</a>
                          <p className="text-xs text-news-lightText mt-1">{art.source} • {art.publishedAt}</p>
                        </div>
                        <div className="flex space-x-2 w-full sm:w-auto sm:flex-shrink-0 justify-end pt-2 sm:pt-0 border-t border-news-bg sm:border-transparent">
                          <button onClick={() => handleBookmarkToggle(art)} className="flex-1 sm:flex-none px-3 py-1.5 border border-news-negative text-news-negative rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors">Remove</button>
                          <a href={`data:text/csv;charset=utf-8,Title,URL\n"${art.title}","${art.url}"`} download="bookmark.csv" className="flex-1 sm:flex-none text-center px-3 py-1.5 bg-news-primary text-white rounded-lg text-xs font-semibold hover:bg-news-primaryHover transition-colors">Export CSV</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ProtectedRoute>
          )}

          {currentPage === 'profile' && (
            <ProtectedRoute isAuthenticated={isAuthenticated} onRedirect={() => setIsAuthenticated(false)}>
              <div className="bg-news-card p-5 sm:p-6 border border-news-border rounded-xl shadow-sm max-w-2xl mx-auto lg:mx-0">
                <h3 className="text-base font-bold text-news-darkText uppercase tracking-wider mb-4">Profile Framework</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-news-lightText uppercase mb-1">Full Identity String</label>
                    <input type="text" value={profileData.username} onChange={e => setProfileData({ ...profileData, username: e.target.value })} className="w-full px-3 py-2 border border-news-border rounded-lg bg-news-bg outline-none text-sm text-news-darkText focus:bg-news-card transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-news-lightText uppercase mb-1">Registered System Email Address</label>
                    <input type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} className="w-full px-3 py-2 border border-news-border rounded-lg bg-news-bg outline-none text-sm text-news-darkText focus:bg-news-card transition-colors" placeholder="yourname@domain.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-news-lightText uppercase mb-1">Context Bio</label>
                    <textarea value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} className="w-full px-3 py-2 border border-news-border rounded-lg bg-news-bg outline-none text-sm text-news-darkText h-24 resize-none focus:bg-news-card transition-colors" />
                  </div>
                  <button onClick={handleSaveProfile} className="w-full sm:w-auto px-5 py-2 bg-news-primary text-white font-semibold text-sm rounded-lg hover:bg-news-primaryHover transition-colors shadow">Save Changes</button>
                </div>
              </div>
            </ProtectedRoute>
          )}

          {currentPage === 'preferences' && (
            <ProtectedRoute isAuthenticated={isAuthenticated} onRedirect={() => setIsAuthenticated(false)}>
              <div className="bg-news-card p-5 sm:p-6 border border-news-border rounded-xl shadow-sm max-w-2xl mx-auto lg:mx-0">
                <h3 className="text-base font-bold text-news-darkText uppercase tracking-wider mb-4">System Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-news-lightText uppercase mb-2">Automated Extraction Domains</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-news-lightText">
                      {['Politics', 'Technology', 'Business', 'Science', 'Health', 'Sports', 'Entertainment', 'World'].map(cat => (
                        <label key={cat} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-news-bg transition-colors">
                          <input type="checkbox" checked={prefCategories.includes(cat)} onChange={() => toggleCategoryPreference(cat)} className="accent-news-primary h-4 w-4" /> 
                          <span className="select-none">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-news-lightText uppercase mb-1">Tracked Phrase Matrices (Default Input Preset)</label>
                    <input type="text" value={prefKeywords} onChange={e => setPrefKeywords(e.target.value)} className="w-full px-3 py-2 border border-news-border rounded-lg bg-news-bg outline-none text-sm text-news-darkText focus:bg-news-card transition-colors" />
                  </div>
                  <button onClick={handleSavePreferences} className="w-full sm:w-auto px-5 py-2 bg-news-primary text-white font-semibold text-sm rounded-lg hover:bg-news-primaryHover transition-colors shadow">Commit Settings</button>
                </div>
              </div>
            </ProtectedRoute>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;