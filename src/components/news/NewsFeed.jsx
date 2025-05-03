import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewsItem = memo(({ item }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    const sources = [
      item.enclosure?.link,
      item.thumbnail,
      item.urlToImage,
      `https://via.placeholder.com/150/3B82F6/FFFFFF?text=${encodeURIComponent(
        item.title.substring(0, 15) || 'News'
      )}`
    ].filter(Boolean);
    return sources[0];
  });

  const handleImageError = () => {
    setImgSrc(`https://via.placeholder.com/150/3B82F6/FFFFFF?text=${
      encodeURIComponent(item.title.substring(0, 15) || 'News')
    }`);
  };

  return (
    <a 
      href={item.link || item.url || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-6 h-full hover:bg-gray-50 transition-colors duration-200"
    >
      <div className="flex items-start gap-4 h-full">
        <div className="w-24 h-16 flex-shrink-0 relative bg-gray-100 rounded-md overflow-hidden">
          <img 
            src={imgSrc}
            alt={item.title || 'News image'}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {item.title || 'No title available'}
          </h3>
          <p className="text-sm text-gray-900 line-clamp-2">
            {item.description?.replace(/<[^>]+>/g, '') || 'No description available'}
          </p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <span>
              {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'Date not available'}
            </span>
            <span className="mx-2">•</span>
            <span>{item.source?.name || 'Unknown Source'}</span>
          </div>
        </div>
      </div>
    </a>
  );
});

const NewsFeed = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const animationFrameRef = useRef(null);
  const apiControllerRef = useRef(null);

  const getFallbackNews = useCallback(() => [
    {
      title: "Global Climate Summit Reaches Agreement",
      description: "World leaders agree on new climate measures to reduce emissions by 2030.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=300",
      source: { name: "Environment News" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "Tech Company Unveils New Device",
      description: "Latest smartphone features breakthrough battery technology and AI camera.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300",
      source: { name: "Tech Daily" },
      publishedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      title: "Economic Forum Addresses Global Challenges",
      description: "World leaders discuss solutions to current economic crises at annual summit.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300",
      source: { name: "Financial Times" },
      publishedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ], []);

  const fetchRSS = useCallback(async (isLoadingMore = false) => {
    if (isLoadingMore) {
      setIsFetchingMore(true);
    } else {
      setLoading(true);
    }
    
    apiControllerRef.current = new AbortController();
    const timeout = setTimeout(() => apiControllerRef.current.abort(), 8000);

    try {
      const response = await axios.get(
        `https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/world/rss.xml`,
        { signal: apiControllerRef.current.signal }
      );
      
      if (response.data.status === 'ok') {
        const formattedNews = response.data.items
          .filter(item => item.title && item.description)
          .map(item => {
            const imageSources = [
              item.enclosure?.link,
              item.thumbnail,
              `https://via.placeholder.com/150/3B82F6/FFFFFF?text=${
                encodeURIComponent(item.title.substring(0, 15))
              }`
            ].filter(Boolean);

            return {
              title: item.title.trim(),
              description: item.description.replace(/<[^>]+>/g, '').trim(),
              link: item.link,
              urlToImage: imageSources[0],
              source: { name: item.author || 'BBC News' },
              publishedAt: item.pubDate || new Date().toISOString()
            };
          });

        if (isLoadingMore) {
          setNews(prev => [...prev, ...formattedNews.slice(prev.length)]);
        } else {
          setNews(formattedNews.slice(0, 5));
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch news');
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.message);
        if (!isLoadingMore) {
          setNews(getFallbackNews());
        }
      }
    } finally {
      clearTimeout(timeout);
      if (isLoadingMore) {
        setIsFetchingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [getFallbackNews]);

  const handleMoreNews = () => {
    navigate('/global-news'); // Change this to your route path
  };

  useEffect(() => {
    fetchRSS();
    return () => {
      if (apiControllerRef.current) {
        apiControllerRef.current.abort();
      }
    };
  }, [fetchRSS]);

  useEffect(() => {
    if (news.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      animationFrameRef.current = requestAnimationFrame(() => {
        setTimeout(() => {
          setCurrentNewsIndex(prev => (prev + 1) % news.length);
          setIsTransitioning(false);
        }, 500);
      });
    }, 8000);

    return () => {
      clearInterval(interval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [news]);

  const getTransformClass = (index) => {
    const isCurrent = index === currentNewsIndex;
    const isPrevious = index === (currentNewsIndex - 1 + news.length) % news.length;

    if (isTransitioning) {
      if (isCurrent) return 'translate-x-full';
      if (isPrevious) return '-translate-x-full';
    } else {
      if (isCurrent) return 'translate-x-0';
      if (isPrevious) return '-translate-x-full';
    }
    return 'translate-x-full';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 relative">
      <div className="bg-gradient-to-r from-blue-200 to-blue-200 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Global News Feed
        </h2>
      </div>
      
      {loading ? (
        <div className="p-6 flex justify-center">
          <div className="animate-pulse flex space-x-4 w-full">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-64 overflow-hidden">
          {news.map((item, index) => (
            <div
              key={`${index}-${item.title}`}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${getTransformClass(index)}`}
              style={{
                zIndex: index === currentNewsIndex ? 20 : 10,
                willChange: 'transform',
                backfaceVisibility: 'hidden'
              }}
            >
              <NewsItem item={item} />
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="p-4 bg-yellow-50 text-yellow-800 text-sm">
          Note: {error}. Showing sample news instead.
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-30">
        <button
          onClick={handleMoreNews}
          disabled={isFetchingMore}
          className="flex items-center gap-2 bg-blue-950 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetchingMore ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              More News
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NewsFeed;