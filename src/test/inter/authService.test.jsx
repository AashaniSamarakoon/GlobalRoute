// src/services/__tests__/authService.test.js
import { loginUser, registerUser } from '../../services/authService';
import axios from 'axios';

jest.mock('axios', () => ({
    post: jest.fn(),
    get: jest.fn()
  }));

  describe('AuthService', () => {
    const API_URL = 'http://api.example.com';
    const mockToken = 'test-token';
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const authConfig = { withCredentials: true };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });

  describe('loginUser', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('successfully logs in a user and returns token/user data', async () => {
      // Arrange
      const mockResponse = { data: { token: mockToken, user: mockUser } };
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await loginUser(loginData.email, loginData.password);

      // Assert
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/auth/login`,
        loginData,
        authConfig
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('throws specific error when invalid credentials are provided', async () => {
      // Arrange
      const errorMessage = 'Invalid email or password';
      const mockError = {
        response: {
          status: 401,
          data: { message: errorMessage }
        },
        isAxiosError: true
      };
      axios.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(loginUser('wrong@example.com', 'wrongpass'))
        .rejects
        .toThrow(errorMessage);
    });

    it('properly handles network errors', async () => {
      // Arrange
      const errorMessage = 'Network Error';
      const mockError = { 
        message: errorMessage, 
        isAxiosError: true,
        code: 'ERR_NETWORK'
      };
      axios.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(loginUser(loginData.email, loginData.password))
        .rejects
        .toThrow(errorMessage);
    });

    it('handles server errors (500)', async () => {
      // Arrange
      const errorMessage = 'Internal server error';
      const mockError = {
        response: {
          status: 500,
          data: { message: errorMessage }
        },
        isAxiosError: true
      };
      axios.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(loginUser(loginData.email, loginData.password))
        .rejects
        .toThrow(errorMessage);
    });
  });

  describe('registerUser', () => {
    const registerData = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User'
    };

    it('successfully registers a new user', async () => {
      // Arrange
      const mockResponse = { data: { token: mockToken, user: mockUser } };
      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await registerUser(
        registerData.email,
        registerData.password,
        registerData.name
      );

      // Assert
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        `${API_URL}/auth/register`,
        registerData,
        authConfig
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('handles validation errors with detailed messages', async () => {
        const validationErrors = {
          email: 'Invalid email format',
          password: 'Password too short',
          name: 'Name is required'
        };
        const mockError = {
          response: {
            status: 400,
            data: { errors: validationErrors }
          },
          isAxiosError: true
        };
        axios.post.mockRejectedValue(mockError);
    
        await expect(registerUser('invalid', 'short', ''))
          .rejects
          .toMatchObject({
            response: {
              data: { errors: validationErrors }
            }
          });
      });
    
      it('handles duplicate email errors with proper status code', async () => {
        const errorMessage = 'Email already in use';
        const mockError = {
          response: {
            status: 409,
            data: { message: errorMessage }
          },
          isAxiosError: true
        };
        axios.post.mockRejectedValue(mockError);
    
        await expect(registerUser('exists@example.com', 'password123', 'Existing User'))
          .rejects
          .toThrow(errorMessage);
      });
    
      it('handles case when server returns unexpected response format', async () => {
        axios.post.mockResolvedValue({ data: { unexpected: 'format' } });
    
        await expect(registerUser('new@example.com', 'password123', 'New User'))
          .rejects
          .toThrow('Invalid response format');
      });
    });
});