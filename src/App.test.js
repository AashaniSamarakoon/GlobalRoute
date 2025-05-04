import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';

// Mock axios and any child components that make API calls
jest.mock('axios');


describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
  });

  test('renders main application container', () => {
    render(<App />);
    const appContainer = screen.getByTestId('app-container');
    expect(appContainer).toBeInTheDocument();
  });

  test('displays loading state initially', () => {
    render(<App />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders navigation header', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  test('fetches and displays initial data', async () => {
    const mockData = [{ id: 1, name: 'Test Item' }];
    axios.get.mockResolvedValue({ data: mockData });

    render(<App />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/initial-data');
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
    });
  });

  test('renders all main sections', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  test('matches snapshot', () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });
});