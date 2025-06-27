const request = require('supertest');
const express = require('express');
const remiseRouter = require('../../src/routes/remise');

jest.mock('../../src/services/remiseService', () => ({
    applyDiscount: jest.fn(),
    calculateDiscountPercentage: jest.fn()
}));

const { applyDiscount, calculateDiscountPercentage } = require('../../src/services/remiseService');

const app = express();
app.use(express.json());
app.use('/', remiseRouter);

describe('Remise Routes', () => {
    describe('GET /remise', () => {
        test('should return 200 with valid parameters', async () => {
            applyDiscount.mockReturnValue({ prix: 100, remise: 10, prixFinal: 90 });

            const res = await request(app).get('/remise?prix=100&pourcentage=10');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                prix: 100,
                remise: 10,
                prixFinal: 90
            });
            expect(applyDiscount).toHaveBeenCalledWith(100, 10);
        });

        test('should return 400 if parameters are missing', async () => {
            const res = await request(app).get('/remise?prix=100');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Bad Request');
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('GET /remise/calculate', () => {
        test('should return 200 with valid parameters', async () => {
            calculateDiscountPercentage.mockReturnValue({ pourcentage: 10 });

            const res = await request(app).get('/remise/calculate?prixInitial=100&prixFinal=90');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ pourcentage: 10 });
            expect(calculateDiscountPercentage).toHaveBeenCalledWith(100, 90);
        });

        test('should return 400 if parameters are missing', async () => {
            const res = await request(app).get('/remise/calculate?prixInitial=100');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Bad Request');
            expect(res.body).toHaveProperty('message');
        });
    });
});
