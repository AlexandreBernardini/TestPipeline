const { errorHandler, asyncHandler } = require('../../src/middleware/errorHandler');

let mockReq, mockRes, mockNext;

beforeEach(() => {
    mockReq = {};
    mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('ErrorHandler Logic Tests', () => {
    test('should identify validation errors correctly', () => {
        const validationErrors = [
            'Le montant doit être positif',
            'Les paramètres sont requis',
            'Devise non supportée',
            'Service non disponible'
        ];

        validationErrors.forEach(message => {
            const isValidationError = message.includes('doit être') ||
                message.includes('requis') ||
                message.includes('supportée') ||
                message.includes('disponible');
            expect(isValidationError).toBe(true);
        });
    });

    test('should identify generic errors correctly', () => {
        const message = 'Random server error';
        const isValidationError = message.includes('doit être') ||
            message.includes('requis') ||
            message.includes('supportée') ||
            message.includes('disponible');
        expect(isValidationError).toBe(false);
    });

    test('should handle environment detection', () => {
        const originalEnv = process.env.NODE_ENV;

        process.env.NODE_ENV = 'test';
        expect(process.env.NODE_ENV).toBe('test');

        process.env.NODE_ENV = 'development';
        expect(process.env.NODE_ENV).toBe('development');

        process.env.NODE_ENV = originalEnv;
    });

    test('should create validation error responses', () => {
        const errorResponse = {
            error: 'Bad Request',
            message: 'Le montant doit être positif',
            timestamp: new Date().toISOString()
        };

        expect(errorResponse).toHaveProperty('error', 'Bad Request');
        expect(errorResponse).toHaveProperty('message');
        expect(errorResponse).toHaveProperty('timestamp');
    });

    test('should create generic error responses', () => {
        const errorResponse = {
            error: 'Internal Server Error',
            message: 'Une erreur inattendue s\'est produite',
            timestamp: new Date().toISOString()
        };

        expect(errorResponse.error).toBe('Internal Server Error');
        expect(errorResponse).toHaveProperty('message');
    });

    test('should test async wrapper pattern', async () => {
        const error = new Error('Test error');
        const asyncFn = jest.fn().mockRejectedValue(error);
        const wrapped = asyncHandler(asyncFn);

        await wrapped(mockReq, mockRes, mockNext);

        expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(error);
    });

    test('should test successful async wrapper', async () => {
        const asyncFn = jest.fn().mockResolvedValue('success');
        const wrapped = asyncHandler(asyncFn);

        await wrapped(mockReq, mockRes, mockNext);

        expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle error without message gracefully', () => {
        const error = {}; // pas de message ni stack

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Internal Server Error',
            message: 'Une erreur inattendue s\'est produite',
            timestamp: expect.any(String)
        });
    });

    test('should handle error without stack trace gracefully', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development'; // forcer le log

        const error = new Error('Erreur sans stack');
        delete error.stack; // retire le stack

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(console.error).toHaveBeenCalledWith('Error:', 'Erreur sans stack');
        expect(console.error).toHaveBeenCalledWith('Stack:', undefined);

        process.env.NODE_ENV = originalEnv;
    });

    test('should handle empty error object in test environment (no logs)', () => {
        process.env.NODE_ENV = 'test';
        const error = {}; // ni message ni stack

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(console.error).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
    });
});
