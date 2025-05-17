import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../../src/components/auth/Register';
import { registerUser } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';

// Mock the dependencies
jest.mock('../../services/authService', () => ({
  registerUser: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Register Component', () => {
  const mockRegister = jest.fn();
  const mockNavigate = jest.fn();

  const renderRegister = () => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ register: mockRegister }}>
          <Register />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the registration form', () => {
    renderRegister();
    
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.getByText('sign in to your existing account')).toBeInTheDocument();
  });

  test('shows error when required fields are empty', async () => {
    renderRegister();
    
    fireEvent.click(screen.getByText('Sign up'));
    
    await waitFor(() => {
      expect(screen.getByText('All fields are required')).toBeInTheDocument();
    });
  });

  test('shows error when passwords do not match', async () => {
    renderRegister();
    
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'differentpassword' } });
    
    fireEvent.click(screen.getByText('Sign up'));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('successful registration', async () => {
    const mockUserData = { id: 1, name: 'John Doe', email: 'john@example.com' };
    registerUser.mockResolvedValue(mockUserData);
    
    renderRegister();
    
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('Sign up'));
    
    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe');
      expect(mockRegister).toHaveBeenCalledWith(mockUserData);
    });
  });
  test('shows loading state during registration', async () => {
    let resolveRegister;
    registerUser.mockImplementation(() => new Promise(resolve => {
      resolveRegister = resolve;
    }));
    
    renderRegister();
    
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('Sign up'));
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Resolve the registration to clean up
    resolveRegister({});
  });

  test('shows error message when registration fails', async () => {
    const errorMessage = 'Registration failed';
    registerUser.mockRejectedValue(new Error(errorMessage));
    
    renderRegister();
    
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByText('Sign up'));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('navigates to login page when login link is clicked', () => {
    renderRegister();
    
    const loginLink = screen.getByText('sign in to your existing account');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});