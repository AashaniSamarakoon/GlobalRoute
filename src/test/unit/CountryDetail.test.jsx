import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CountryDetail from '../../components/countries/CountryDetail'; // Update path as needed
import { fetchCountryByCode } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CountryContext } from '../../context/CountryContext';

// Mock the API and context dependencies
jest.mock('../../services/api', () => ({
  fetchCountryByCode: jest.fn(),
}));

describe('CountryDetail Component', () => {
  const mockCountry = {
    cca3: 'USA',
    name: {
      common: 'United States',
      nativeName: {
        eng: { common: 'United States' }
      }
    },
    flags: { svg: 'https://flagcdn.com/us.svg' },
    population: 331002651,
    region: 'Americas',
    subregion: 'North America',
    capital: ['Washington D.C.'],
    tld: ['.us'],
    currencies: {
      USD: { name: 'United States dollar', symbol: '$' }
    },
    languages: { eng: 'English' },
    borders: ['CAN', 'MEX']
  };

  const mockAuthContext = {
    currentUser: { id: 1, email: 'test@example.com' }
  };

  const mockCountryContext = {
    toggleFavorite: jest.fn(),
    isFavorite: jest.fn().mockReturnValue(false)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (code) => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <CountryContext.Provider value={mockCountryContext}>
          <MemoryRouter initialEntries={[`/country/${code}`]}>
            <Routes>
              <Route path="/country/:code" element={<CountryDetail />} />
            </Routes>
          </MemoryRouter>
        </CountryContext.Provider>
      </AuthContext.Provider>
    );
  };

  test('renders loading state initially', () => {
    fetchCountryByCode.mockImplementation(() => new Promise(() => {}));
    renderWithRouter('USA');
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders error state when API fails', async () => {
    fetchCountryByCode.mockRejectedValue(new Error('API Error'));
    renderWithRouter('USA');
    
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch country details/i)).toBeInTheDocument();
    });
  });

  test('renders country not found when no data', async () => {
    fetchCountryByCode.mockResolvedValue(null);
    renderWithRouter('INVALID');
    
    await waitFor(() => {
      expect(screen.getByText(/country not found/i)).toBeInTheDocument();
    });
  });

  test('renders country details after successful fetch', async () => {
    fetchCountryByCode.mockResolvedValue(mockCountry);
    renderWithRouter('USA');
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('331,002,651')).toBeInTheDocument();
      expect(screen.getByText('Americas')).toBeInTheDocument();
      expect(screen.getByText('Washington D.C.')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('CAN')).toBeInTheDocument();
      expect(screen.getByText('MEX')).toBeInTheDocument();
    });
  });

  test('renders favorite button for authenticated users', async () => {
    fetchCountryByCode.mockResolvedValue(mockCountry);
    renderWithRouter('USA');
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /favorite/i })).toBeInTheDocument();
    });
  });

  test('does not render favorite button for unauthenticated users', async () => {
    fetchCountryByCode.mockResolvedValue(mockCountry);
    
    render(
      <AuthContext.Provider value={{ currentUser: null }}>
        <CountryContext.Provider value={mockCountryContext}>
          <MemoryRouter initialEntries={['/country/USA']}>
            <Routes>
              <Route path="/country/:code" element={<CountryDetail />} />
            </Routes>
          </MemoryRouter>
        </CountryContext.Provider>
      </AuthContext.Provider>
    );
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /favorite/i })).not.toBeInTheDocument();
    });
  });

  test('toggles favorite when favorite button is clicked', async () => {
    fetchCountryByCode.mockResolvedValue(mockCountry);
    renderWithRouter('USA');
    
    await waitFor(() => {
      const favoriteButton = screen.getByRole('button', { name: /favorite/i });
      fireEvent.click(favoriteButton);
      expect(mockCountryContext.toggleFavorite).toHaveBeenCalledWith('USA');
    });
  });

  test('shows filled star when country is favorite', async () => {
    fetchCountryByCode.mockResolvedValue(mockCountry);
    mockCountryContext.isFavorite.mockReturnValue(true);
    
    renderWithRouter('USA');
    
    await waitFor(() => {
      const starIcon = screen.getByTestId('favorite-icon');
      expect(starIcon).toHaveAttribute('fill', 'currentColor');
      expect(starIcon).toHaveAttribute('color', '#f59e0b');
    });
  });

  test('shows empty star when country is not favorite', async () => {
    fetchCountryByCode.mockResolvedValue(mockCountry);
    mockCountryContext.isFavorite.mockReturnValue(false);
    
    renderWithRouter('USA');
    
    await waitFor(() => {
      const starIcon = screen.getByTestId('favorite-icon');
      expect(starIcon).toHaveAttribute('fill', 'none');
      expect(starIcon).toHaveAttribute('color', '#4b5563');
    });
  });

  test('renders "N/A" for missing optional fields', async () => {
    const countryWithoutOptional = {
      ...mockCountry,
      subregion: undefined,
      capital: undefined,
      tld: undefined,
      currencies: undefined,
      languages: undefined,
      borders: undefined
    };
    
    fetchCountryByCode.mockResolvedValue(countryWithoutOptional);
    renderWithRouter('USA');
    
    await waitFor(() => {
      expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
      expect(screen.getByText('No border countries')).toBeInTheDocument();
    });
  });
});