import React from 'react';
import NewsItem from './NewsItem';

const NewsItemList = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No news articles available at the moment. Please check back later.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <NewsItem 
          key={`${index}-${item.title || index}`} 
          item={item} 
        />
      ))}
    </div>
  );
};

export default NewsItemList;