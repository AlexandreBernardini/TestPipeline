const request = require('supertest');
const app = require('../../src/app');

describe('End-to-End Scenarios', () => {
    describe('Complete conversion and tax calculation workflow', () => {
        test('should convert currency then calculate VAT on converted amount', async () => {
            // Étape 1: Convertir 100 EUR en USD
            const conversionResponse = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            expect(conversionResponse.body).toEqual({
                from: 'EUR',
                to: 'USD',
                originalAmount: 100,
                convertedAmount: 110,
                rate: 1.1
            });

            // Étape 2: Calculer la TVA sur le montant converti (110 USD avec 8.5% de TVA)
            const convertedAmount = conversionResponse.body.convertedAmount;
            const tvaResponse = await request(app)
                .get(`/tva?ht=${convertedAmount}&taux=8.5`)
                .expect(200);

            expect(tvaResponse.body.ht).toBe(110);
            expect(tvaResponse.body.taux).toBe(8.5);
            expect(tvaResponse.body.montantTva).toBe(9.35);
            expect(tvaResponse.body.ttc).toBe(119.35);

            // Vérification du workflow complet
            expect(tvaResponse.body.ttc).toBeGreaterThan(conversionResponse.body.convertedAmount);
        });

        test('should convert currency, apply discount, then calculate VAT', async () => {
            // Étape 1: Convertir 1000 USD en GBP
            const conversionResponse = await request(app)
                .get('/convert?from=USD&to=GBP&amount=1000')
                .expect(200);

            expect(conversionResponse.body.convertedAmount).toBe(800);

            // Étape 2: Appliquer une remise de 15% sur le montant converti
            const convertedAmount = conversionResponse.body.convertedAmount;
            const discountResponse = await request(app)
                .get(`/remise?prix=${convertedAmount}&pourcentage=15`)
                .expect(200);

            expect(discountResponse.body.prixInitial).toBe(800);
            expect(discountResponse.body.prixFinal).toBe(680);

            // Étape 3: Calculer la TVA sur le prix après remise
            const discountedPrice = discountResponse.body.prixFinal;
            const tvaResponse = await request(app)
                .get(`/tva?ht=${discountedPrice}&taux=20`)
                .expect(200);

            expect(tvaResponse.body.ht).toBe(680);
            expect(tvaResponse.body.ttc).toBe(816);

            // Vérification du workflow complet
// Vérifications du workflow complet
            const finalAmount = tvaResponse.body.ttc;
            expect(finalAmount).toBeGreaterThan(discountResponse.body.prixFinal); // Prix final > prix après remise (à cause de la TVA)
            expect(discountResponse.body.prixFinal).toBeLessThan(conversionResponse.body.convertedAmount); // Prix après remise < prix converti initial
        });
    });

    describe('Complex business scenarios', () => {
        test('should handle international pricing workflow', async () => {
            // Scénario: Prix international avec conversion, remise volume et TVA locale

            // 1. Prix de base en EUR
            const basePrice = 500;

            // 2. Convertir en USD pour client américain
            const conversionResponse = await request(app)
                .get(`/convert?from=EUR&to=USD&amount=${basePrice}`)
                .expect(200);

            const usdPrice = conversionResponse.body.convertedAmount;
            expect(usdPrice).toBe(550);

            // 3. Appliquer remise volume de 12%
            const discountResponse = await request(app)
                .get(`/remise?prix=${usdPrice}&pourcentage=12`)
                .expect(200);

            const discountedPrice = discountResponse.body.prixFinal;
            expect(discountedPrice).toBe(484);

            // 4. Calculer TVA locale (6%)
            const tvaResponse = await request(app)
                .get(`/tva?ht=${discountedPrice}&taux=6`)
                .expect(200);

            const finalPrice = tvaResponse.body.ttc;
            expect(finalPrice).toBe(513.04);

            // Vérifications du workflow complet
            expect(finalPrice).toBeLessThan(usdPrice); // Prix final < prix converti (grâce à la remise)
            expect(finalPrice).toBeGreaterThan(discountedPrice); // Prix final > prix après remise (à cause de la TVA)
        });

        test('should handle reverse calculation scenario', async () => {
            // Scénario: Calcul inverse - partir du prix TTC final pour retrouver le prix HT initial

            const finalTTCPrice = 240;
            const taxRate = 20;

            // 1. Calculer le HT à partir du TTC
            const reverseResponse = await request(app)
                .get(`/tva/reverse?ttc=${finalTTCPrice}&taux=${taxRate}`)
                .expect(200);

            const htPrice = reverseResponse.body.ht;
            expect(htPrice).toBe(200);

            // 2. Supposons que ce HT était le résultat d'une remise de 10%
            // Calculer le prix initial avant remise
            const discountCalcResponse = await request(app)
                .get(`/remise/calculate?prixInitial=222.22&prixFinal=${htPrice}`)
                .expect(200);

            // 3. Vérifier la cohérence
            const originalPrice = discountCalcResponse.body.prixInitial;
            expect(discountCalcResponse.body.pourcentage).toBe(10);

            // Workflow inverse complet validé
            expect(originalPrice).toBeGreaterThan(htPrice);
            expect(htPrice).toBeLessThan(finalTTCPrice);
        });
    });

    describe('Error handling in workflows', () => {
        test('should handle errors gracefully in multi-step workflow', async () => {
            // 1. Conversion valide
            const conversionResponse = await request(app)
                .get('/convert?from=EUR&to=USD&amount=100')
                .expect(200);

            const convertedAmount = conversionResponse.body.convertedAmount;

            // 2. Tentative de remise invalide (>100%)
            const invalidDiscountResponse = await request(app)
                .get(`/remise?prix=${convertedAmount}&pourcentage=150`)
                .expect(400);

            expect(invalidDiscountResponse.body.error).toBe('Bad Request');

            // 3. Continuer avec une remise valide
            const validDiscountResponse = await request(app)
                .get(`/remise?prix=${convertedAmount}&pourcentage=10`)
                .expect(200);

            expect(validDiscountResponse.body.prixFinal).toBe(99);

            // 4. Calculer TVA sur le bon montant
            const tvaResponse = await request(app)
                .get(`/tva?ht=${validDiscountResponse.body.prixFinal}&taux=20`)
                .expect(200);

            expect(tvaResponse.body.ttc).toBe(118.8);
        });

        test('should validate all steps in currency conversion chain', async () => {
            // Test avec des valeurs limites et cas d'erreur

            // 1. Conversion avec montant 0
            const zeroConversionResponse = await request(app)
                .get('/convert?from=EUR&to=USD&amount=0')
                .expect(200);

            expect(zeroConversionResponse.body.convertedAmount).toBe(0);

            // 2. Remise de 100% (cas limite valide)
            const fullDiscountResponse = await request(app)
                .get('/remise?prix=100&pourcentage=100')
                .expect(200);

            expect(fullDiscountResponse.body.prixFinal).toBe(0);

            // 3. TVA sur montant 0
            const zeroTvaResponse = await request(app)
                .get('/tva?ht=0&taux=20')
                .expect(200);

            expect(zeroTvaResponse.body.ttc).toBe(0);
        });
    });

    describe('Performance and load scenarios', () => {
        test('should handle multiple parallel workflows', async () => {
            // Simulation de plusieurs clients effectuant des calculs simultanément
            const workflows = [];

            for (let i = 0; i < 5; i++) {
                const workflow = async () => {
                    const amount = 100 + i * 50;

                    // Conversion
                    const conversion = await request(app)
                        .get(`/convert?from=EUR&to=USD&amount=${amount}`)
                        .expect(200);

                    // Remise
                    const discount = await request(app)
                        .get(`/remise?prix=${conversion.body.convertedAmount}&pourcentage=${5 + i}`)
                        .expect(200);

                    // TVA
                    const tva = await request(app)
                        .get(`/tva?ht=${discount.body.prixFinal}&taux=${15 + i}`)
                        .expect(200);

                    return {
                        original: amount,
                        converted: conversion.body.convertedAmount,
                        discounted: discount.body.prixFinal,
                        final: tva.body.ttc
                    };
                };

                workflows.push(workflow());
            }

            const results = await Promise.all(workflows);

            // Vérifier que tous les workflows ont réussi
            expect(results).toHaveLength(5);
            results.forEach((result, index) => {
                expect(result.converted).toBeGreaterThan(result.original);
                expect(result.discounted).toBeLessThan(result.converted);
                expect(result.final).toBeGreaterThan(result.discounted);
            });
        });
    });
});