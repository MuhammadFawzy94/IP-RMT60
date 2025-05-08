const { createToken, verifyToken } = require('../helpers/jwt');
const { comparePassword, hashPassword } = require('../helpers/bcrypt');
const { geminiApi } = require('../helpers/gemini');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Mock dependencies
jest.mock('@google/generative-ai', () => {
  const generateContentMock = jest.fn();
  const getPayloadMock = jest.fn();
  
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockImplementation(() => ({
        generateContent: generateContentMock
      }))
    }))
  };
});

describe('JWT Helpers', () => {
  beforeEach(() => {
    // Set a test secret key
    process.env.SECRET_KEY = 'test-secret-key';
  });

  test('should create a valid token', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = createToken(payload);
    
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  test('should verify a valid token', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = createToken(payload);
    
    const decoded = verifyToken(token);
    
    expect(decoded).toHaveProperty('id', payload.id);
    expect(decoded).toHaveProperty('email', payload.email);
  });

  test('should throw error for invalid token', () => {
    const invalidToken = 'invalid.token.string';
    
    expect(() => {
      verifyToken(invalidToken);
    }).toThrow();
  });
});

describe('Bcrypt Helpers', () => {
  test('should return true for matching password', () => {
    const password = 'password123';
    const hashedPassword = hashPassword(password);
    
    const result = comparePassword(password, hashedPassword);
    
    expect(result).toBe(true);
  });

  test('should return false for non-matching password', () => {
    const password = 'password123';
    const wrongPassword = 'wrongpassword';
    const hashedPassword = hashPassword(password);
    
    const result = comparePassword(wrongPassword, hashedPassword);
    
    expect(result).toBe(false);
  });
});

describe('Gemini API Helper', () => {
  beforeEach(() => {
    // Setup environment variables and mocks
    process.env.Gemini_API_KEY = 'test-gemini-api-key';
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return response from Gemini API', async () => {
    // Setup mock response
    const mockResponse = {
      response: {
        text: jest.fn().mockReturnValue('Mocked Gemini API response')
      }
    };
    
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const mockGenerateContent = GoogleGenerativeAI().getGenerativeModel().generateContent;
    
    mockGenerateContent.mockResolvedValue(mockResponse);
    
    // Execute
    const result = await geminiApi({ prompt: 'Test prompt' });
    
    // Assert
    expect(mockGenerateContent).toHaveBeenCalled();
    expect(result).toBe('Mocked Gemini API response');
  });

  test('should handle API errors gracefully', async () => {
    // Setup mock error
    const apiError = new Error('API request failed');
    
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const mockGenerateContent = GoogleGenerativeAI().getGenerativeModel().generateContent;
    
    mockGenerateContent.mockRejectedValue(apiError);
    
    // Execute and Assert
    await expect(geminiApi({ prompt: 'Test prompt' })).rejects.toThrow('Gemini API Error');
    expect(console.error).toHaveBeenCalled();
  });
});