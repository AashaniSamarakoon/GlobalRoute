import React, { memo, useState } from 'react';

const NewsItem = memo(({ item }) => {
  const [imgSrc, setImgSrc] = useState(() => {
    // Prioritize different image sources in this order
    const sources = [
      item.enclosure?.link,  // RSS enclosure link
      item.thumbnail,        // Common thumbnail field
      item.urlToImage,       // Standard API field
      // BBC-specific media content
      item.media?.thumbnail?.url,
      item.media?.content?.url,
      // Fallback placeholder
      `https://via.placeholder.com/300/3B82F6/FFFFFF?text=${
        encodeURIComponent((item.source?.name || 'News').substring(0, 15))
      }`
    ].filter(Boolean);
    
    return sources[0];
  });

  const handleImageError = () => {
    // Try HTTPS if HTTP fails
    if (imgSrc.startsWith('http:')) {
      setImgSrc(imgSrc.replace('http:', 'https:'));
    } else {
      // Fallback to placeholder
      setImgSrc(`https://via.placeholder.com/300/3B82F6/FFFFFF?text=${
        encodeURIComponent((item.source?.name || 'News').substring(0, 15))
      }`);
    }
  };

  return (
    <a 
      href={item.link || item.url || '#'} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-6 hover:bg-gray-50 transition-colors duration-200 group"
    >
      <div className="flex items-start gap-4">
        <div className="w-24 h-16 flex-shrink-0 relative bg-gray-100 rounded-md overflow-hidden">
          <img 
            src={imgSrc}
            alt={item.title || 'News image'}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {item.title || 'No title available'}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3">
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

export default NewsItem;