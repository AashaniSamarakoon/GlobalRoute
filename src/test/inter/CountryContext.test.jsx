// src/context/__tests__/CountryContext.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { CountryProvider, useCountryContext } from '../../context/CountryContext';
import { fetchAllCountries, fetchCountryByCode } from '../../services/api';

jest.mock('../../services/api', () => ({
  fetchAllCountries: jest.fn(),
  fetchCountryByCode: jest.fn()
}));

describe('CountryContext', () => {
  const mockCountries = [
    { cca3: 'USA', name: { common: 'United States' }, region: 'Americas' },
    { cca3: 'CAN', name: { common: 'Canada' }, region: 'Americas' },
    { cca3: 'GBR', name: { common: 'United Kingdom' }, region: 'Europe' }
  ];

  beforeEach(() => {
    fetchAllCountries.mockResolvedValue(mockCountries);
    fetchCountryByCode.mockImplementation((code) => 
      Promise.resolve(mockCountries.find(c => c.cca3 === code))
    );
  });

  const wrapper = ({ children }) => (
    <CountryProvider>{children}</CountryProvider>
  );
  it('loads countries and provides them to components', async () => {
    const { result } = renderHook(() => useCountryContext(), { wrapper });

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.countries).toEqual(mockCountries);
      expect(result.current.filteredCountries).toEqual(mockCountries);
    });
  
    
    expect(result.current.loading).toBe(false);
    expect(result.current.countries).toEqual(mockCountries);
    expect(result.current.filteredCountries).toEqual(mockCountries);
  });

  it('filters countries by region', async () => {
    const wrapper = ({ children }) => (
      <CountryContextProvider>{children}</CountryContextProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useCountryContext(), { wrapper });

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    
    act(() => {
      result.current.filterByRegion('Europe');
    });

    expect(result.current.filteredCountries).toEqual([
      { cca3: 'GBR', name: { common: 'United Kingdom' }, region: 'Europe' }
    ]);
    expect(result.current.selectedRegion).toBe('Europe');
  });

  it('toggles favorite countries', async () => {
    const wrapper = ({ children }) => (
      <CountryContextProvider>{children}</CountryContextProvider>
    );
    
    const { result, waitForNextUpdate } = renderHook(() => useCountryContext(), { wrapper });

    await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    
    act(() => {
      result.current.toggleFavorite('USA');
    });

    expect(result.current.isFavorite('USA')).toBe(true);
    
    act(() => {
      result.current.toggleFavorite('USA');
    });

    expect(result.current.isFavorite('USA')).toBe(false);
  });
});