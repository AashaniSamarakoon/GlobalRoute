import { render, screen, waitFor } from '@testing-library/react';
import GlobalNewsPage from '../../pages/GlobalNewsPage';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

// Mock axios
jest.mock('axios');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock NewsItemList
jest.mock('../../components/news/NewsItemList', () => {
  return function MockNewsItemList({ items }) {
    return (
      <div data-testid="news-item-list">
        {items.map((item, index) => (
          <div key={index} data-testid="news-item">{item.title}</div>
        ))}
      </div>
    );
  };
});

describe('GlobalNewsPage', () => {
  const mockNewsData = {
    status: 'ok',
    items: [
      {
        title: 'Test News 1',
        description: 'Test description 1',
        link: '#1',
        enclosure: { link: 'image1.jpg' },
        author: 'Author 1',
        pubDate: new Date().toISOString()
      },
      {
        title: 'Test News 2',
        description: 'Test description 2',
        link: '#2',
        enclosure: { link: 'image2.jpg' },
        author: 'Author 2',
        pubDate: new Date().toISOString()
      }
    ]
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows loading spinner initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <MemoryRouter>
        <GlobalNewsPage />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays news items after successful fetch', async () => {
    axios.get.mockResolvedValueOnce({ data: mockNewsData });
    
    render(
      <MemoryRouter>
        <GlobalNewsPage />
      </MemoryRouter>
    );
    
    // Should show loading initially
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Wait for news items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    
    const newsItems = screen.getAllByTestId('news-item');
    expect(newsItems).toHaveLength(2);
    expect(newsItems[0]).toHaveTextContent('Test News 1');
    expect(newsItems[1]).toHaveTextContent('Test News 2');
  });

  it('displays error message when fetch fails', async () => {
    const errorMessage = 'Failed to fetch news';
    axios.get.mockRejectedValueOnce(new Error(errorMessage));
    
    render(
      <MemoryRouter>
        <GlobalNewsPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
    });
  });
});