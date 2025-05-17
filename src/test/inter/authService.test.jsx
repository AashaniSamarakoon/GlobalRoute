import { loginUser, registerUser } from '../../services/authService';

describe('AuthService', () => {
  describe('loginUser', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('successfully logs in a user and returns user data', async () => {
      const user = await loginUser(loginCredentials.email, loginCredentials.password);
      
      expect(user).toEqual({
        id: expect.any(String),
        email: loginCredentials.email,
        name: expect.any(String)
      });    });

    it('handles login errors when credentials are missing', async () => {
      await expect(loginUser('', '')).rejects.toThrow('Email and password are required');
    });
    
    it('handles login errors when email is missing', async () => {
      await expect(loginUser('', 'password123')).rejects.toThrow('Email and password are required');
    });
    
    it('handles login errors when password is missing', async () => {
      await expect(loginUser('test@example.com', '')).rejects.toThrow('Email and password are required');
    });
    });
  });
  describe('registerUser', () => {
    const registerData = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User'
    };

    it('successfully registers a new user', async () => {
      const user = await registerUser(registerData.email, registerData.password, registerData.name);
      
      expect(user).toEqual({
        id: expect.any(String),
        email: registerData.email,
        name: registerData.name
      });
    });

    it('handles registration errors when data is missing', async () => {
      await expect(registerUser('', '', '')).rejects.toThrow('Email and password are required');
    });

    it('handles registration errors when email is missing', async () => {
      await expect(registerUser('', 'password123', 'Test User')).rejects.toThrow('Email and password are required');
    });

    it('handles registration errors when password is missing', async () => {
      await expect(registerUser('test@example.com', '', 'Test User')).rejects.toThrow('Email and password are required');
    });
  });
