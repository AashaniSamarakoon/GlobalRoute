import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MapContainer } from 'react-leaflet';
import '@testing-library/jest-dom';
import Map from '../../components/map/Map'; // Update path as needed
import { fetchAllCountries } from '../../services/api';

// Mock the API
jest.mock('../../services/api', () => ({
    fetchAllCountries: jest.fn(),
  }));
  
  // Mock react-leaflet components
  jest.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    GeoJSON: jest.fn(() => <div data-testid="geojson-layer" />),
    Marker: jest.fn(() => <div data-testid="marker" />),
    Popup: jest.fn(({ children }) => <div data-testid="popup">{children}</div>),
    useMap: () => ({
      setView: jest.fn(),
      flyTo: jest.fn()
    })
  }));
  
  // Mock Leaflet
  jest.mock('leaflet', () => ({
    circleMarker: jest.fn(() => ({
      bindPopup: jest.fn(),
      setStyle: jest.fn(),
      on: jest.fn(),
    })),
    map: jest.fn(),
  }));
  
  describe('Map Component', () => {
    const mockCountries = [
      {
        name: { common: 'United States' },
        cca3: 'USA',
        capital: ['Washington D.C.'],
        population: 331002651,
        flags: { svg: 'https://flagcdn.com/us.svg' },
        latlng: [38, -97]
      }
    ];
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('renders loading state initially', () => {
        fetchAllCountries.mockImplementation(() => new Promise(() => {}));
        render(<Map />);
        expect(screen.getByTestId('map-loading')).toBeInTheDocument();
      });
      
      test('creates correct GeoJSON data structure', async () => {
        fetchAllCountries.mockResolvedValue(mockCountries);
        render(<Map />);
        
        await waitFor(() => {
          const geoJSONCall = jest.mocked(require('react-leaflet').GeoJSON).mock.calls[0][0];
          expect(geoJSONCall.data.features.length).toBe(mockCountries.length);
        });
      });

  test('handles countries without latlng', async () => {
    const countriesWithoutLatLng = [
      {
        ...mockCountries[0],
        latlng: undefined
      }
    ];
    
    fetchAllCountries.mockResolvedValue(countriesWithoutLatLng);
    render(<Map />);
    
    await waitFor(() => {
      const geoJSONCall = jest.mocked(require('react-leaflet').GeoJSON).mock.calls[0][0];
      const feature = geoJSONCall.data.features[0];
      expect(feature.geometry.coordinates).toEqual([0, 0]);
    });
  });

  test('handles countries without capital', async () => {
    const countriesWithoutCapital = [
      {
        ...mockCountries[0],
        capital: undefined
      }
    ];
    
    fetchAllCountries.mockResolvedValue(countriesWithoutCapital);
    render(<Map />);
    
    await waitFor(() => {
      const geoJSONCall = jest.mocked(require('react-leaflet').GeoJSON).mock.calls[0][0];
      const feature = geoJSONCall.data.features[0];
      expect(feature.properties.capital).toBe('N/A');
    });
  });

  test('creates circle markers with correct styling', async () => {
    fetchAllCountries.mockResolvedValue(mockCountries);
    render(<Map />);
    
    await waitFor(() => {
      const geoJSONCall = jest.mocked(require('react-leaflet').GeoJSON).mock.calls[0][0];
      const pointToLayer = geoJSONCall.pointToLayer;
      
      // Mock latlng for testing
      const mockLatLng = [10, 20];
      const mockFeature = {
        properties: {
          iso_a3: 'USA'
        }
      };
      
      // Call the pointToLayer function
      pointToLayer(mockFeature, mockLatLng);
      
      // Verify Leaflet.circleMarker was called with correct parameters
      expect(require('leaflet').circleMarker).toHaveBeenCalledWith(mockLatLng, {
        radius: 5,
        fillColor: "#3b82f6",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    });
  });

  test('binds popup with correct content', async () => {
    fetchAllCountries.mockResolvedValue(mockCountries);
    render(<Map />);
    
    await waitFor(() => {
      const geoJSONCall = jest.mocked(require('react-leaflet').GeoJSON).mock.calls[0][0];
      const onEachFeature = geoJSONCall.onEachFeature;
      
      // Mock layer for testing
      const mockLayer = {
        bindPopup: jest.fn(),
        on: jest.fn()
      };
      
      // Call the onEachFeature function
      onEachFeature(
        {
          properties: {
            name: 'United States',
            capital: 'Washington D.C.',
            population: 331002651,
            flag: 'https://flagcdn.com/us.svg'
          }
        },
        mockLayer
      );
      
      // Verify popup content was created correctly
      expect(mockLayer.bindPopup).toHaveBeenCalled();
      const popupContent = mockLayer.bindPopup.mock.calls[0][0];
      expect(popupContent).toContain('United States');
      expect(popupContent).toContain('Washington D.C.');
      expect(popupContent).toContain('331,002,651');
      expect(popupContent).toContain('https://flagcdn.com/us.svg');
    });
  });
});