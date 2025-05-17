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
  Link: ({ children }) => <div>{children}</div>,
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