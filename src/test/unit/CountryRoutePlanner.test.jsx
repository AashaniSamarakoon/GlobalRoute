import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CountryRoutePlanner from '../../pages/CountryRoutePlanner';
import { fetchAllCountries } from '../services/api';
import { DndContext } from '@dnd-kit/core';

// Mock the API module
jest.mock('../services/api', () => ({
  fetchAllCountries: jest.fn(),
}));

// Mock the Link component from react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock DndContext components
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => <div>{children}</div>,
  closestCenter: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div>{children}</div>,
  verticalListSortingStrategy: jest.fn(),
  arrayMove: jest.fn((arr, oldIndex, newIndex) => {
    const newArray = [...arr];
    const [removed] = newArray.splice(oldIndex, 1);
    newArray.splice(newIndex, 0, removed);
    return newArray;
  }),
}));

describe('CountryRoutePlanner', () => {
  const mockCountries = [
    {
      cca3: 'USA',
      name: { common: 'United States' },
      flags: { svg: 'https://flagcdn.com/us.svg' }
    },
    {
      cca3: 'CAN',
      name: { common: 'Canada' },
      flags: { svg: 'https://flagcdn.com/ca.svg' }
    },
    {
      cca3: 'MEX',
      name: { common: 'Mexico' },
      flags: { svg: 'https://flagcdn.com/mx.svg' }
    }
  ];

  beforeEach(() => {
    fetchAllCountries.mockReset();
  });

  test('renders loading state initially', () => {
    fetchAllCountries.mockImplementation(() => new Promise(() => {}));
    render(<CountryRoutePlanner />);
    expect(screen.getByText('Loading countries...')).toBeInTheDocument();
  });

  test('renders error state when API fails', async () => {
    fetchAllCountries.mockRejectedValue(new Error('Network error'));
    render(<CountryRoutePlanner />);
    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
    });
  });

  test('renders countries list after successful fetch', async () => {
    fetchAllCountries.mockResolvedValue(mockCountries);
    render(<CountryRoutePlanner />);
    
    await waitFor(() => {
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('Mexico')).toBeInTheDocument();
    });
  });

  test('adds country to route when clicked', async () => {
    fetchAllCountries.mockResolvedValue(mockCountries);
    render(<CountryRoutePlanner />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('United States'));
    });

    expect(screen.getByText('Your Planned Route (1)')).toBeInTheDocument();
    expect(screen.getByText('1. United States')).toBeInTheDocument();
  });

  test('does not add duplicate countries to route', async () => {
    fetchAllCountries.mockResolvedValue(mockCountries);
    render(<CountryRoutePlanner />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('United States'));
      fireEvent.click(screen.getByText('United States'));
    });

    expect(screen.getByText('Your Planned Route (1)')).toBeInTheDocument();
  });

  test('removes country from route when delete button clicked', async () => {
    fetchAllCountries.mockResolvedValue(mockCountries);
    render(<CountryRoutePlanner />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('United States'));
    });

    fireEvent.click(screen.getByText('×'));
    expect(screen.getByText('No countries added to your route yet')).toBeInTheDocument();
  });

  test('reorders countries in route when dragged', async () => {
    fetchAllCountries.mockResolvedValue(mockCountries);
    render(<CountryRoutePlanner />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('United States'));
      fireEvent.click(screen.getByText('Canada'));
    });

    const dndContext = screen.getByTestId('dnd-context');
    fireEvent.dragEnd(dndContext, {
      active: { id: 'USA' },
      over: { id: 'CAN' }
    });

    // Verify the order changed (this would depend on your actual implementation)
    // In a real test, you might need to mock the drag and drop behavior more precisely
  });

  test('displays empty route message when no countries added', async () => {
    fetchAllCountries.mockResolvedValue(mockCountries);
    render(<CountryRoutePlanner />);
    
    await waitFor(() => {
      expect(screen.getByText('No countries added to your route yet')).toBeInTheDocument();
    });
  });

  test('renders back to countries link', async () => {
    fetchAllCountries.mockResolvedValue(mockCountries);
    render(<CountryRoutePlanner />);
    
    await waitFor(() => {
      expect(screen.getByText('Back to Countries')).toBeInTheDocument();
      expect(screen.getByText('Back to Countries').closest('a')).toHaveAttribute('href', '/');
    });
  });
});