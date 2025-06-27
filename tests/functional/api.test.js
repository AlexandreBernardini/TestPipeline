const request = require('supertest');
const app = require('../../src/app');

describe('API Routes - Functional Tests', () => {
    describe('Health Check', () => {
        test('GET /health should return 200 and service status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('service', 'microservice-conversion-calculs');
        });
    });

    describe('Currency Conversion Routes', () => {
        test('GET /convert should convert EUR to USD correctly', async () => {
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

        test('GET /convert should convert USD to GBP correctly', async () => {
            const response = await request(app)
                .get('/convert?from=USD&to=GBP&amount=100')
                .expect(200);

            expect(response.body).toEqual({
                from: 'USD',
                to: 'GBP',
                originalAmount: 100,
                convertedAmount: 80,
                rate: 0.8
            });
        });

        test('GET /convert should handle case insensitive currencies', async () => {
            const response = await request(app)
                .get('/convert?from=eur&to=usd&amount=100')
                .expect(200);

            expect(response.body.from).toBe('EUR');
            expect(response.body.to).toBe('USD');
        });

        test('GET /convert should return 400 for missing parameters', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&amount=100')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('requis');
        });

        test('GET /convert should return 400 for unsupported currency', async () => {
            const response = await request(app)
                .get('/convert?from=JPY&to=USD&amount=100')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('supportée');
        });

        test('GET /convert should return 400 for negative amount', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=-100')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('positif');
        });

        test('GET /currencies should return supported currencies', async () => {
            const response = await request(app)
                .get('/currencies')
                .expect(200);

            expect(response.body).toHaveProperty('supportedCurrencies');
            expect(response.body).toHaveProperty('count');
            expect(Array.isArray(response.body.supportedCurrencies)).toBe(true);
            expect(response.body.supportedCurrencies).toContain('EUR');
            expect(response.body.supportedCurrencies).toContain('USD');
            expect(response.body.supportedCurrencies).toContain('GBP');
        });
    });

    describe('TVA Calculation Routes', () => {
        test('GET /tva should calculate TTC correctly', async () => {
            const response = await request(app)
                .get('/tva?ht=100&taux=20')
                .expect(200);

            expect(response.body).toEqual({
                ht: 100,
                taux: 20,
                montantTva: 20,
                ttc: 120
            });
        });

        test('GET /tva should return 400 for missing parameters', async () => {
            const response = await request(app)
                .get('/tva?ht=100')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('requis');
        });

        test('GET /tva should return 400 for negative HT', async () => {
            const response = await request(app)
                .get('/tva?ht=-100&taux=20')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('positif');
        });

        test('GET /tva should return 400 for invalid tax rate', async () => {
            const response = await request(app)
                .get('/tva?ht=100&taux=150')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('entre 0 et 100');
        });

        test('GET /tva/reverse should calculate HT from TTC correctly', async () => {
            const response = await request(app)
                .get('/tva/reverse?ttc=120&taux=20')
                .expect(200);

            expect(response.body.ttc).toBe(120);
            expect(response.body.taux).toBe(20);
            expect(response.body.ht).toBe(100);
            expect(response.body.montantTva).toBe(20);
        });

        test('GET /tva/reverse should return 400 for missing parameters', async () => {
            const response = await request(app)
                .get('/tva/reverse?ttc=120')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('requis');
        });
    });

    describe('Discount Routes', () => {
        test('GET /remise should apply discount correctly', async () => {
            const response = await request(app)
                .get('/remise?prix=100&pourcentage=10')
                .expect(200);

            expect(response.body).toEqual({
                prixInitial: 100,
                pourcentage: 10,
                montantRemise: 10,
                prixFinal: 90
            });
        });

        test('GET /remise should return 400 for missing parameters', async () => {
            const response = await request(app)
                .get('/remise?prix=100')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('requis');
        });

        test('GET /remise should return 400 for negative price', async () => {
            const response = await request(app)
                .get('/remise?prix=-100&pourcentage=10')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('positif');
        });

        test('GET /remise should return 400 for invalid percentage', async () => {
            const response = await request(app)
                .get('/remise?prix=100&pourcentage=150')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('entre 0 et 100');
        });

        test('GET /remise/calculate should calculate discount percentage correctly', async () => {
            const response = await request(app)
                .get('/remise/calculate?prixInitial=100&prixFinal=90')
                .expect(200);

            expect(response.body).toEqual({
                prixInitial: 100,
                prixFinal: 90,
                montantRemise: 10,
                pourcentage: 10
            });
        });

        test('GET /remise/calculate should return 400 for missing parameters', async () => {
            const response = await request(app)
                .get('/remise/calculate?prixInitial=100')
                .expect(400);

            expect(response.body.error).toBe('Bad Request');
            expect(response.body.message).toContain('requis');
        });
    });

    describe('Error Handling', () => {
        test('should return 404 for non-existent routes', async () => {
            const response = await request(app)
                .get('/non-existent-route')
                .expect(404);

            expect(response.body.error).toBe('Route not found');
            expect(response.body.message).toContain('/non-existent-route');
        });

        test('should return proper error format with timestamp', async () => {
            const response = await request(app)
                .get('/convert?from=EUR&to=USD&amount=-100')
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('timestamp');
        });
    });
});