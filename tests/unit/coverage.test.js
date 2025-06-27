// Tests simples pour améliorer la couverture
const request = require('supertest');
const app = require('../../src/app');

describe('Coverage Tests', () => {
    test('should handle 404 for unknown routes', async () => {
        const response = await request(app)
            .get('/unknown-route')
            .expect(404);

        expect(response.body.error).toBe('Route not found');
    });

    test('should return health status', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);

        expect(response.body.status).toBe('OK');
        expect(response.body.service).toBe('microservice-conversion-calculs');
    });

    test('should handle missing parameters in convert', async () => {
        await request(app)
            .get('/convert')
            .expect(400);
    });

    test('should handle missing parameters in tva', async () => {
        await request(app)
            .get('/tva')
            .expect(400);
    });

    test('should handle missing parameters in remise', async () => {
        await request(app)
            .get('/remise')
            .expect(400);
    });

    test('should handle invalid currency conversion', async () => {
        await request(app)
            .get('/convert?from=INVALID&to=USD&amount=100')
            .expect(400);
    });

    test('should handle invalid tva calculation', async () => {
        await request(app)
            .get('/tva?ht=-100&taux=20')
            .expect(400);
    });

    test('should handle invalid remise calculation', async () => {
        await request(app)
            .get('/remise?prix=-100&pourcentage=10')
            .expect(400);
    });

    test('should get supported currencies', async () => {
        const response = await request(app)
            .get('/currencies')
            .expect(200);

        expect(response.body.supportedCurrencies).toContain('EUR');
        expect(response.body.supportedCurrencies).toContain('USD');
    });

    test('should handle tva reverse calculation', async () => {
        const response = await request(app)
            .get('/tva/reverse?ttc=120&taux=20')
            .expect(200);

        expect(response.body.ht).toBe(100);
    });

    test('should handle remise percentage calculation', async () => {
        const response = await request(app)
            .get('/remise/calculate?prixInitial=100&prixFinal=90')
            .expect(200);

        expect(response.body.pourcentage).toBe(10);
    });
});