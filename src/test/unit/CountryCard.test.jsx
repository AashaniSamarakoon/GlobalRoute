import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CountryCard from '../../components/countries/CountryCard'; // Update path as needed
import { AuthContext, CountryContext } from '../../context';

const mockCountry = {
  cca3: 'USA',
  name: { common: 'United States' },
  flags: { svg: 'https://flagcdn.com/us.svg' },
  population: 331002651,
  region: 'Americas',
  capital: ['Washington, D.C.']
};

describe('CountryCard Component', () => {
  const mockToggleFavorite = jest.fn();
  const mockIsFavorite = jest.fn().mockReturnValue(false);
  
  const renderCard = (user = {}) => {
    return render(
      <AuthContext.Provider value={{ currentUser: user }}>
        <CountryContext.Provider value={{ 
          toggleFavorite: mockToggleFavorite, 
          isFavorite: mockIsFavorite 
        }}>
          <MemoryRouter>
            <CountryCard country={mockCountry} />
          </MemoryRouter>
        </CountryContext.Provider>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders country information correctly', () => {
    renderCard();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText(/331,002,651/)).toBeInTheDocument();
    expect(screen.getByText('Americas')).toBeInTheDocument();
    expect(screen.getByText('Washington, D.C.')).toBeInTheDocument();
    expect(screen.getByAltText('Flag of United States')).toBeInTheDocument();
  });

  it('does not show favorite button when not logged in', () => {
    renderCard(null);
    expect(screen.queryByRole('button', { name: /favorite/i })).not.toBeInTheDocument();
  });

  it('shows favorite button when logged in', () => {
    renderCard({ name: 'Test User' });
    expect(screen.getByRole('button', { name: /favorite/i })).toBeInTheDocument();
  });

  it('calls toggleFavorite when favorite button is clicked', () => {
    renderCard({ name: 'Test User' });
    fireEvent.click(screen.getByRole('button', { name: /favorite/i }));
    expect(mockToggleFavorite).toHaveBeenCalledWith('USA');
  });

  it('shows filled star when country is favorite', () => {
    mockIsFavorite.mockReturnValueOnce(true);
    renderCard({ name: 'Test User' });
    const starIcon = screen.getByTestId('favorite-icon');
    expect(starIcon).toHaveAttribute('fill', 'currentColor');
    expect(starIcon).toHaveAttribute('color', '#f59e0b');
  });
});