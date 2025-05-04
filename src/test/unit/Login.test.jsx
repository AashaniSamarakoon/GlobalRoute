import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../components/auth/Login';
import { loginUser } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';



// Mock dependencies
jest.mock('../../services/authService', () => ({
    loginUser: jest.fn(),
  }));

// Add at the top of Login.test.jsx
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Simple mock
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../services/authService', () => ({
  loginUser: jest.fn(),
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  
  const renderLogin = () => {
    return render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <Login />
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderLogin();
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error when fields are empty', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/email and password are required/i)).toBeInTheDocument();
  });

// In the "submits form with valid data" test
it('submits form with valid data', async () => {
    const { loginUser } = require('../../services/authService');
    loginUser.mockResolvedValueOnce({ 
      token: '123', 
      user: { name: 'Test User' } 
    });

    renderLogin();
    
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });


  it('shows error when login fails', async () => {
    const { loginUser } = require('../../services/authService');
    loginUser.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLogin();
    
    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'wrongpass' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});