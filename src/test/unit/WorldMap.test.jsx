import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorldMap from '../../components/map/Map';

// Mock Leaflet
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: jest.fn()
      },
      mergeOptions: jest.fn()
    }
  },
  divIcon: jest.fn().mockReturnValue({
    options: {},
    _setIconStyles: jest.fn(),
  }),
  marker: jest.fn().mockReturnValue({
    bindPopup: jest.fn().mockReturnThis(),
    bindTooltip: jest.fn().mockReturnThis(),
    on: jest.fn(),
  })
}));

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="map-marker">{children}</div>,
  Tooltip: ({ children }) => <div data-testid="marker-tooltip">{children}</div>,
  Popup: ({ children }) => <div data-testid="marker-popup">{children}</div>
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

import { CountryContext } from '../../context/CountryContext';
import { AuthContext } from '../../context/AuthContext';

const mockCountryContext = {
  countries: [],
  filteredCountries: [
    {
      cca3: 'USA',
      name: { common: 'United States' },
      capital: ['Washington, D.C.'],
      latlng: [38, -97],
      population: 331002651,
      flags: { svg: 'us-flag.svg' },
      region: 'Americas'
    }
  ],
  getFavoriteCountries: jest.fn().mockReturnValue([]),
  isFavorite: jest.fn().mockReturnValue(false)
};

const mockAuthContext = {
  currentUser: null
};

const TestWrapper = ({ children }) => (
  <AuthContext.Provider value={mockAuthContext}>
    <CountryContext.Provider value={mockCountryContext}>
      {children}
    </CountryContext.Provider>
  </AuthContext.Provider>
);

// Convert hex color to RGB format for testing
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
};

describe('WorldMap Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders map container with default settings', () => {
    render(
      <TestWrapper>
        <WorldMap />
      </TestWrapper>
    );
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  it('renders markers for countries with coordinates', async () => {
    render(
      <TestWrapper>
        <WorldMap />
      </TestWrapper>
    );
    const markers = await screen.findAllByTestId('map-marker');
    expect(markers.length).toBeGreaterThan(0);
  });
  
  it('displays tooltip with country information on marker hover', async () => {
    render(
      <TestWrapper>
        <WorldMap />
      </TestWrapper>
    );
    const tooltip = await screen.findByTestId('marker-tooltip');
    expect(tooltip).toHaveTextContent('United States');
    expect(tooltip).toHaveTextContent('Washington, D.C.');
  });

  it('displays popup with detailed information when marker is clicked', async () => {
    render(
      <TestWrapper>
        <WorldMap />
      </TestWrapper>
    );
    const marker = await screen.findByTestId('map-marker');
    fireEvent.click(marker);
    
    const popup = screen.getByTestId('marker-popup');
    expect(popup).toHaveTextContent('United States');
    expect(popup).toHaveTextContent('Population: 331,002,651');
  });

  it('navigates to country detail page when View Details is clicked', async () => {
    render(
      <TestWrapper>
        <WorldMap />
      </TestWrapper>
    );
    const marker = await screen.findByTestId('map-marker');
    fireEvent.click(marker);
    
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/country/USA');
  });
  
  it('renders favorite countries when favoritesOnly is true', () => {
    const favoriteCountries = [{
      cca3: 'CAN',
      name: { common: 'Canada' },
      capital: ['Ottawa'],
      latlng: [45, -75],
      population: 38250000,
      flags: { svg: 'can-flag.svg' },
      region: 'Americas'
    }];
    
    const contextWithFavorites = {
      ...mockCountryContext,
      getFavoriteCountries: jest.fn().mockReturnValue(favoriteCountries)
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <CountryContext.Provider value={contextWithFavorites}>
          <WorldMap favoritesOnly={true} />
        </CountryContext.Provider>
      </AuthContext.Provider>
    );
    expect(screen.getByText('Your Favorite Countries')).toBeInTheDocument();
  });

  it('filters out countries without coordinates', () => {
    const countriesWithoutCoords = [
      ...mockCountryContext.filteredCountries,
      {
        cca3: 'TEST',
        name: { common: 'Test Country' },
        capital: ['Test City'],
        latlng: undefined,
        population: 1000000,
        flags: { svg: 'test-flag.svg' },
        region: 'Test Region'
      }
    ];
    
    const contextWithMixedCountries = {
      ...mockCountryContext,
      filteredCountries: countriesWithoutCoords
    };

    render(
      <TestWrapper>
        <WorldMap />
      </TestWrapper>
    );
    
    const markers = screen.getAllByTestId('map-marker');
    expect(markers.length).toBe(1); // Only the country with coordinates
  });
});