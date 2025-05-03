// src/pages/GlobalNewsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NewsItemList from '../components/news/NewsItemList';

const GlobalNewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  

  const fetchAllNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    

    try {
      const response = await axios.get(
        `https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/world/rss.xml`,
        { signal: controller.signal }
      );
      
      if (response.data?.status === 'ok') {
// In your GlobalNewsPage component's fetchAllNews function:
const formattedNews = (response.data.items || [])
  .filter(item => item?.title && item?.description)
  .map(item => ({
    title: item.title?.trim(),
    description: item.description?.replace(/<[^>]+>/g, '')?.trim(),
    link: item.link,
    enclosure: item.enclosure, // Make sure this is included
    thumbnail: item.thumbnail,
    urlToImage: item.enclosure?.link, // Prioritize enclosure link
    media: item.media, // Include media object if available
    source: { name: item.author || 'BBC News' },
    publishedAt: item.pubDate || new Date().toISOString()
  }));
          
        setNews(formattedNews.length > 0 ? formattedNews : getFallbackNews());
      } else {
        throw new Error(response.data?.message || 'Failed to fetch news');
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.message);
        setNews(getFallbackNews());
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [getFallbackNews]);

  useEffect(() => {
    fetchAllNews();
  }, [fetchAllNews]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Global News</h1>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-900 hover:text-blue-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </button>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 text-yellow-800 text-sm mb-4 rounded-lg">
          <strong>Note:</strong> {error}. Showing {news.length > 0 ? 'some' : 'fallback'} news.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <NewsItemList items={news} />
      </div>
    </div>
  );
};

export default GlobalNewsPage;