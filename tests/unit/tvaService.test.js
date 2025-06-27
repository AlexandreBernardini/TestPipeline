const {
    calculateTTC,
    calculateHT,
    validateTvaParams
} = require('../../src/services/tvaService');

describe('TvaService - Unit Tests', () => {
    describe('validateTvaParams', () => {
        test('should not throw for valid parameters', () => {
            expect(() => validateTvaParams(100, 20)).not.toThrow();
        });

        test('should throw error for negative HT amount', () => {
            expect(() => validateTvaParams(-10, 20))
                .toThrow('Le montant HT doit être un nombre positif');
        });

        test('should throw error for invalid HT amount', () => {
            expect(() => validateTvaParams('invalid', 20))
                .toThrow('Le montant HT doit être un nombre positif');
        });

        test('should throw error for negative tax rate', () => {
            expect(() => validateTvaParams(100, -5))
                .toThrow('Le taux de TVA doit être un nombre entre 0 et 100');
        });

        test('should throw error for tax rate over 100', () => {
            expect(() => validateTvaParams(100, 150))
                .toThrow('Le taux de TVA doit être un nombre entre 0 et 100');
        });

        test('should throw error for invalid tax rate', () => {
            expect(() => validateTvaParams(100, 'invalid'))
                .toThrow('Le taux de TVA doit être un nombre entre 0 et 100');
        });

        test('should accept zero values', () => {
            expect(() => validateTvaParams(0, 0)).not.toThrow();
        });

        test('should accept 100% tax rate', () => {
            expect(() => validateTvaParams(100, 100)).not.toThrow();
        });
    });

    describe('calculateTTC', () => {
        test('should calculate TTC correctly with 20% tax', () => {
            const result = calculateTTC(100, 20);

            expect(result).toEqual({
                ht: 100,
                taux: 20,
                montantTva: 20,
                ttc: 120
            });
        });

        test('should calculate TTC correctly with 0% tax', () => {
            const result = calculateTTC(100, 0);

            expect(result).toEqual({
                ht: 100,
                taux: 0,
                montantTva: 0,
                ttc: 100
            });
        });

        test('should calculate TTC correctly with decimal values', () => {
            const result = calculateTTC(99.99, 19.6);

            expect(result.ht).toBe(99.99);
            expect(result.taux).toBe(19.6);
            expect(result.montantTva).toBe(19.6);
            expect(result.ttc).toBe(119.59);
        });

        test('should round to 2 decimal places', () => {
            const result = calculateTTC(33.33, 20);

            expect(result.montantTva).toBe(6.67);
            expect(result.ttc).toBe(40);
        });

        test('should handle string inputs', () => {
            const result = calculateTTC('100', '20');

            expect(result.ht).toBe(100);
            expect(result.taux).toBe(20);
            expect(result.ttc).toBe(120);
        });
    });

    describe('calculateHT', () => {
        test('should calculate HT correctly from TTC with 20% tax', () => {
            const result = calculateHT(120, 20);

            expect(result.ttc).toBe(120);
            expect(result.taux).toBe(20);
            expect(result.ht).toBe(100);
            expect(result.montantTva).toBe(20);
        });

        test('should calculate HT correctly with 0% tax', () => {
            const result = calculateHT(100, 0);

            expect(result).toEqual({
                ttc: 100,
                taux: 0,
                montantTva: 0,
                ht: 100
            });
        });

        test('should handle decimal calculations correctly', () => {
            const result = calculateHT(119.6, 19.6);

            expect(result.ttc).toBe(119.6);
            expect(result.taux).toBe(19.6);
            expect(result.ht).toBe(100);
            expect(result.montantTva).toBe(19.6);
        });

        test('should round results to 2 decimal places', () => {
            const result = calculateHT(33.33, 20);

            expect(result.ht).toBe(27.77);
            expect(result.montantTva).toBe(5.56);
        });

        test('should throw error for negative TTC', () => {
            expect(() => calculateHT(-10, 20))
                .toThrow('Le montant TTC doit être un nombre positif');
        });

        test('should throw error for invalid TTC', () => {
            expect(() => calculateHT('invalid', 20))
                .toThrow('Le montant TTC doit être un nombre positif');
        });
    });
});