import { render, screen, waitFor, act } from '@testing-library/react';
import GlobalNewsPage from '../../pages/GlobalNewsPage'; // Updated import path
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

// Mock NewsItemList with proper path
jest.mock('../../components/news/NewsItemList', () => {
    return function MockNewsItemList({ items }) {
      return (
        <div data-testid="news-item-list">
          {items.map((item, index) => (
            <div key={index}>{item.title}</div>
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

  const mockFallbackNews = [
    {
      title: "Fallback News",
      description: "Fallback description",
      url: "#",
      urlToImage: "fallback.jpg",
      source: { name: "Fallback Source" },
      publishedAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading spinner initially', async () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    render(
      <MemoryRouter>
        <GlobalNewsPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    await act(() => Promise.resolve());
  });

  it('displays news items after successful fetch', async () => {
    axios.get.mockResolvedValue({ data: mockNewsData });
    
    render(
      <MemoryRouter>
        <GlobalNewsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test News 1')).toBeInTheDocument();
      expect(screen.getByText('Test News 2')).toBeInTheDocument();
    });
  });

  it('displays fallback news when API fails', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    
    render(
      <MemoryRouter>
        <GlobalNewsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Fallback News')).toBeInTheDocument();
      expect(screen.getByText(/showing fallback news/i)).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    const errorMessage = 'Failed to fetch news';
    axios.get.mockRejectedValue(new Error(errorMessage));
    
    render(
      <MemoryRouter>
        <GlobalNewsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('handles empty response from API', async () => {
    axios.get.mockResolvedValue({ data: { status: 'ok', items: [] } });
    
    render(
      <MemoryRouter>
        <GlobalNewsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Global News')).toBeInTheDocument();
      expect(screen.queryByTestId('news-item-list')).toBeEmptyDOMElement();
    });
  });

  it('aborts fetch request when unmounted', async () => {
    const abortSpy = jest.spyOn(AbortController.prototype, 'abort');
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    const { unmount } = render(
      <MemoryRouter>
        <GlobalNewsPage />
      </MemoryRouter>
    );

    unmount();
    
    expect(abortSpy).toHaveBeenCalled();
    abortSpy.mockRestore();
  });
});