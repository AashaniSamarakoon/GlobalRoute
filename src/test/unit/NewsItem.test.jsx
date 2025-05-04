// src/components/news/__tests__/NewsItem.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import NewsItem from '../../components/news/NewsItem';

const mockItem = {
  title: 'Global Climate Summit Reaches Agreement',
  description: 'World leaders agree on new climate measures to reduce emissions by 2030.',
  link: 'https://example.com/news',
  urlToImage: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17',
  source: { name: 'Environment News' },
  publishedAt: '2023-05-15T10:00:00Z'
};

describe('NewsItem Component', () => {
  it('renders news item correctly', () => {
    render(<NewsItem item={mockItem} />);
    
    expect(screen.getByText(mockItem.title)).toBeInTheDocument();
    expect(screen.getByText(mockItem.description)).toBeInTheDocument();
    expect(screen.getByText('Environment News')).toBeInTheDocument();
    expect(screen.getByText('May 15, 2023')).toBeInTheDocument();
    expect(screen.getByAltText(mockItem.title)).toBeInTheDocument();
  });

  it('uses fallback image when image fails to load', () => {
    const itemWithoutImage = {
      ...mockItem,
      urlToImage: undefined
    };
    
    render(<NewsItem item={itemWithoutImage} />);
    const img = screen.getByAltText(mockItem.title);
    fireEvent.error(img);
    
    expect(img).toHaveAttribute('src', expect.stringContaining('via.placeholder.com'));
  });

  it('handles missing description', () => {
    const itemWithoutDesc = {
      ...mockItem,
      description: undefined
    };
    
    render(<NewsItem item={itemWithoutDesc} />);
    expect(screen.getByText('No description available')).toBeInTheDocument();
  });
});