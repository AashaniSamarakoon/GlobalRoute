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
      );      if (response.data?.status === 'ok') {
        const formattedNews = (response.data.items || [])
          .filter(item => item?.title && item?.description)
          .map(item => ({
            title: item.title?.trim(),
            description: item.description?.replace(/<[^>]+>/g, '')?.trim(),
            link: item.link,
            enclosure: item.enclosure,
            thumbnail: item.thumbnail,
            urlToImage: item.enclosure?.link || item.thumbnail,
            source: { name: item.author || 'BBC News' },
            publishedAt: item.pubDate || new Date().toISOString()
          }));
          
        if (formattedNews.length === 0) {
          setNews([]);
        } else {
          setNews(formattedNews);
        }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Global News</h1>
      {loading ? (
        <div data-testid="loading-spinner" className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div data-testid="error-message" className="text-red-500 text-center py-4">
          {error.message || error}
        </div>
      ) : (
        <NewsItemList items={news} />
      )}
    </div>
  );
}

export default GlobalNewsPage;