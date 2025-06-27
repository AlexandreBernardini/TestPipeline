const {
    applyDiscount,
    calculateDiscountPercentage,
    validateRemiseParams
} = require('../../src/services/remiseService');

describe('RemiseService - Unit Tests', () => {
    describe('validateRemiseParams', () => {
        test('should not throw for valid parameters', () => {
            expect(() => validateRemiseParams(100, 10)).not.toThrow();
        });

        test('should throw error for negative price', () => {
            expect(() => validateRemiseParams(-10, 10))
                .toThrow('Le prix doit être un nombre positif');
        });

        test('should throw error for invalid price', () => {
            expect(() => validateRemiseParams('invalid', 10))
                .toThrow('Le prix doit être un nombre positif');
        });

        test('should throw error for negative percentage', () => {
            expect(() => validateRemiseParams(100, -5))
                .toThrow('Le pourcentage de remise doit être un nombre entre 0 et 100');
        });

        test('should throw error for percentage over 100', () => {
            expect(() => validateRemiseParams(100, 150))
                .toThrow('Le pourcentage de remise doit être un nombre entre 0 et 100');
        });

        test('should throw error for invalid percentage', () => {
            expect(() => validateRemiseParams(100, 'invalid'))
                .toThrow('Le pourcentage de remise doit être un nombre entre 0 et 100');
        });

        test('should accept zero values', () => {
            expect(() => validateRemiseParams(0, 0)).not.toThrow();
        });

        test('should accept 100% discount', () => {
            expect(() => validateRemiseParams(100, 100)).not.toThrow();
        });
    });

    describe('applyDiscount', () => {
        test('should apply 10% discount correctly', () => {
            const result = applyDiscount(100, 10);

            expect(result).toEqual({
                prixInitial: 100,
                pourcentage: 10,
                montantRemise: 10,
                prixFinal: 90
            });
        });

        test('should apply 0% discount correctly', () => {
            const result = applyDiscount(100, 0);

            expect(result).toEqual({
                prixInitial: 100,
                pourcentage: 0,
                montantRemise: 0,
                prixFinal: 100
            });
        });

        test('should apply 100% discount correctly', () => {
            const result = applyDiscount(100, 100);

            expect(result).toEqual({
                prixInitial: 100,
                pourcentage: 100,
                montantRemise: 100,
                prixFinal: 0
            });
        });

        test('should handle decimal values correctly', () => {
            const result = applyDiscount(99.99, 15.5);

            expect(result.prixInitial).toBe(99.99);
            expect(result.pourcentage).toBe(15.5);
            expect(result.montantRemise).toBe(15.5);
            expect(result.prixFinal).toBe(84.49);
        });

        test('should round to 2 decimal places', () => {
            const result = applyDiscount(33.33, 33.33);

            expect(result.montantRemise).toBe(11.11);
            expect(result.prixFinal).toBe(22.22);
        });

        test('should handle string inputs', () => {
            const result = applyDiscount('100', '10');

            expect(result.prixInitial).toBe(100);
            expect(result.pourcentage).toBe(10);
            expect(result.prixFinal).toBe(90);
        });
    });

    describe('calculateDiscountPercentage', () => {
        test('should calculate 10% discount correctly', () => {
            const result = calculateDiscountPercentage(100, 90);

            expect(result).toEqual({
                prixInitial: 100,
                prixFinal: 90,
                montantRemise: 10,
                pourcentage: 10
            });
        });

        test('should calculate 0% discount correctly', () => {
            const result = calculateDiscountPercentage(100, 100);

            expect(result).toEqual({
                prixInitial: 100,
                prixFinal: 100,
                montantRemise: 0,
                pourcentage: 0
            });
        });

        test('should calculate 100% discount correctly', () => {
            const result = calculateDiscountPercentage(100, 0);

            expect(result).toEqual({
                prixInitial: 100,
                prixFinal: 0,
                montantRemise: 100,
                pourcentage: 100
            });
        });

        test('should handle decimal calculations correctly', () => {
            const result = calculateDiscountPercentage(80, 60);

            expect(result.prixInitial).toBe(80);
            expect(result.prixFinal).toBe(60);
            expect(result.montantRemise).toBe(20);
            expect(result.pourcentage).toBe(25);
        });

        test('should round percentage to 2 decimal places', () => {
            const result = calculateDiscountPercentage(33.33, 22.22);

            expect(result.pourcentage).toBe(33.33);
        });

        test('should throw error for zero initial price', () => {
            expect(() => calculateDiscountPercentage(0, 50))
                .toThrow('Le prix initial doit être un nombre positif non nul');
        });

        test('should throw error for negative initial price', () => {
            expect(() => calculateDiscountPercentage(-10, 50))
                .toThrow('Le prix initial doit être un nombre positif non nul');
        });

        test('should throw error for negative final price', () => {
            expect(() => calculateDiscountPercentage(100, -10))
                .toThrow('Le prix final doit être un nombre positif');
        });

        test('should throw error when final price is higher than initial', () => {
            expect(() => calculateDiscountPercentage(100, 150))
                .toThrow('Le prix final ne peut pas être supérieur au prix initial');
        });

        test('should throw error for invalid prices', () => {
            expect(() => calculateDiscountPercentage('invalid', 50))
                .toThrow('Le prix initial doit être un nombre positif non nul');

            expect(() => calculateDiscountPercentage(100, 'invalid'))
                .toThrow('Le prix final doit être un nombre positif');
        });
    });
});