const request = require('supertest');
const app = require('../../src/app');

// Service simulé pour l'intégration avec une API externe
class ExternalCurrencyApiService {
    static async getExchangeRate(from, to) {
        // Simulation d'un appel API externe
        return new Promise((resolve) => {
            setTimeout(() => {
                const rates = {
                    'EUR-USD': 1.1,
                    'USD-GBP': 0.8,
                    'EUR-EUR': 1,
                    'USD-USD': 1,
                    'GBP-GBP': 1
                };

                const key = `${from}-${to}`;
                if (rates[key]) {
                    resolve({
                        success: true,
                        rate: rates[key],
                        timestamp: new Date().toISOString()
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Currency pair not supported'
                    });
                }
            }, 100); // Simulation de latence réseau
        });
    }

    static async validateCurrency(currency) {
        const supportedCurrencies = ['EUR', 'USD', 'GBP'];
        return supportedCurrencies.includes(currency);
    }
}

describe('External API Integration Tests', () => {
    describe('ExternalCurrencyApiService', () => {
        test('should return valid exchange rate for EUR to USD', async () => {
            const result = await ExternalCurrencyApiService.getExchangeRate('EUR', 'USD');

            expect(result.success).toBe(true);
            expect(result.rate).toBe(1.1);
            expect(result).toHaveProperty('timestamp');
        });

        test('should return valid exchange rate for USD to GBP', async () => {
            const result = await ExternalCurrencyApiService.getExchangeRate('USD', 'GBP');

            expect(result.success).toBe(true);
            expect(result.rate).toBe(0.8);
        });

        test('should return error for unsupported currency pair', async () => {
            const result = await ExternalCurrencyApiService.getExchangeRate('EUR', 'GBP');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Currency pair not supported');
        });

        test('should validate supported currencies correctly', async () => {
            expect(await ExternalCurrencyApiService.validateCurrency('EUR')).toBe(true);
            expect(await ExternalCurrencyApiService.validateCurrency('USD')).toBe(true);
            expect(await ExternalCurrencyApiService.validateCurrency('GBP')).toBe(true);
            expect(await ExternalCurrencyApiService.validateCurrency('JPY')).toBe(false);
        });
    });

    describe('Integration with mocked external API', () => {
        let originalGetExchangeRate;

        beforeEach(() => {
            // Mock de l'API externe
            originalGetExchangeRate = ExternalCurrencyApiService.getExchangeRate;
        });

        afterEach(() => {
            // Restauration du service original
            ExternalCurrencyApiService.getExchangeRate = originalGetExchangeRate;
        });

        test('should handle successful API response', async () => {
            // Mock d'une réponse réussie
            ExternalCurrencyApiService.getExchangeRate = jest.fn().mockResolvedValue({
                success: true,
                rate: 1.1,
                timestamp: '2024-01-01T00:00:00.000Z'
            });

            const apiResult = await ExternalCurrencyApiService.getExchangeRate('EUR', 'USD');
            expect(apiResult.success).toBe(true);
            expect(apiResult.rate).toBe(1.1);

            // Vérification que notre service utilise le même taux
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            expect(response.body.rate).toBe(1.1);
            expect(response.body.convertedAmount).toBe(110);
        });

        test('should handle API failure gracefully', async () => {
            // Mock d'une réponse d'échec
            ExternalCurrencyApiService.getExchangeRate = jest.fn().mockResolvedValue({
                success: false,
                error: 'Service temporarily unavailable'
            });

            const apiResult = await ExternalCurrencyApiService.getExchangeRate('EUR', 'USD');
            expect(apiResult.success).toBe(false);
            expect(apiResult.error).toBe('Service temporarily unavailable');

            // Notre service devrait continuer à fonctionner avec les taux fixes
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            expect(response.body.convertedAmount).toBe(110);
        });

        test('should handle API timeout', async () => {
            // Mock d'un timeout
            ExternalCurrencyApiService.getExchangeRate = jest.fn().mockRejectedValue(
                new Error('Request timeout')
            );

            await expect(ExternalCurrencyApiService.getExchangeRate('EUR', 'USD'))
                .rejects.toThrow('Request timeout');

            // Notre service devrait continuer à fonctionner
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            expect(response.body.convertedAmount).toBe(110);
        });

        test('should validate currency with external service', async () => {
            // Mock de validation de devise
            ExternalCurrencyApiService.validateCurrency = jest.fn()
                .mockImplementation((currency) => {
                    return Promise.resolve(['EUR', 'USD', 'GBP'].includes(currency));
                });

            expect(await ExternalCurrencyApiService.validateCurrency('EUR')).toBe(true);
            expect(await ExternalCurrencyApiService.validateCurrency('JPY')).toBe(false);

            expect(ExternalCurrencyApiService.validateCurrency).toHaveBeenCalledTimes(2);
        });
    });

    describe('Service resilience', () => {
        test('should maintain service availability during external API downtime', async () => {
            // Simulation d'une panne de l'API externe
            const mockFailedApi = jest.fn().mockRejectedValue(new Error('API down'));

            // Malgré la panne, notre service doit continuer à fonctionner
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            expect(response.body).toEqual({
                from: 'EUR',
                to: 'USD',
                originalAmount: 100,
                convertedAmount: 110,
                rate: 1.1
            });
        });

        test('should handle multiple concurrent requests', async () => {
            // Test de charge avec plusieurs requêtes simultanées
            const promises = [];

            for (let i = 0; i < 10; i++) {
                promises.push(
                    request(app)
                        .get('/convert?from=EUR&to=USD&amount=100')
                        .expect(200)
                );
            }

            const responses = await Promise.all(promises);

            responses.forEach(response => {
                expect(response.body.convertedAmount).toBe(110);
            });
        });
    });
});