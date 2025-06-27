const {
    convertCurrency,
    getExchangeRate,
    getSupportedCurrencies,
    validateConversionParams
} = require('../../src/services/conversionService');

describe('ConversionService - Unit Tests', () => {
    describe('validateConversionParams', () => {
        test('should not throw for valid parameters', () => {
            expect(() => validateConversionParams('EUR', 'USD', 100)).not.toThrow();
        });

        test('should throw error for missing from parameter', () => {
            expect(() => validateConversionParams('', 'USD', 100))
                .toThrow('Les paramètres "from" et "to" sont requis');
        });

        test('should throw error for missing to parameter', () => {
            expect(() => validateConversionParams('EUR', '', 100))
                .toThrow('Les paramètres "from" et "to" sont requis');
        });

        test('should throw error for unsupported source currency', () => {
            expect(() => validateConversionParams('JPY', 'USD', 100))
                .toThrow('Devise source "JPY" non supportée');
        });

        test('should throw error for unsupported conversion pair', () => {
            expect(() => validateConversionParams('EUR', 'GBP', 100))
                .toThrow('Conversion de EUR vers GBP non supportée');
        });

        test('should throw error for negative amount', () => {
            expect(() => validateConversionParams('EUR', 'USD', -10))
                .toThrow('Le montant doit être un nombre positif');
        });

        test('should throw error for invalid amount', () => {
            expect(() => validateConversionParams('EUR', 'USD', 'invalid'))
                .toThrow('Le montant doit être un nombre positif');
        });
    });

    describe('convertCurrency', () => {
        test('should convert EUR to USD correctly', () => {
            const result = convertCurrency('EUR', 'USD', 100);

            expect(result).toEqual({
                from: 'EUR',
                to: 'USD',
                originalAmount: 100,
                convertedAmount: 110,
                rate: 1.1
            });
        });

        test('should convert USD to GBP correctly', () => {
            const result = convertCurrency('USD', 'GBP', 100);

            expect(result).toEqual({
                from: 'USD',
                to: 'GBP',
                originalAmount: 100,
                convertedAmount: 80,
                rate: 0.8
            });
        });

        test('should handle same currency conversion', () => {
            const result = convertCurrency('EUR', 'EUR', 100);

            expect(result).toEqual({
                from: 'EUR',
                to: 'EUR',
                originalAmount: 100,
                convertedAmount: 100,
                rate: 1
            });
        });

        test('should handle decimal amounts correctly', () => {
            const result = convertCurrency('EUR', 'USD', 99.99);

            expect(result.originalAmount).toBe(99.99);
            expect(result.convertedAmount).toBe(109.99);
        });

        test('should round to 2 decimal places', () => {
            const result = convertCurrency('EUR', 'USD', 33.33);

            expect(result.convertedAmount).toBe(36.66);
        });
    });

    describe('getExchangeRate', () => {
        test('should return correct rate for EUR to USD', () => {
            const rate = getExchangeRate('EUR', 'USD');
            expect(rate).toBe(1.1);
        });

        test('should return correct rate for USD to GBP', () => {
            const rate = getExchangeRate('USD', 'GBP');
            expect(rate).toBe(0.8);
        });

        test('should throw error for unsupported pair', () => {
            expect(() => getExchangeRate('EUR', 'GBP'))
                .toThrow('Taux de change non disponible pour EUR vers GBP');
        });
    });

    describe('getSupportedCurrencies', () => {
        test('should return array of supported currencies', () => {
            const currencies = getSupportedCurrencies();

            expect(Array.isArray(currencies)).toBe(true);
            expect(currencies).toContain('EUR');
            expect(currencies).toContain('USD');
            expect(currencies).toContain('GBP');
        });

        test('should return consistent results', () => {
            const currencies1 = getSupportedCurrencies();
            const currencies2 = getSupportedCurrencies();

            expect(currencies1).toEqual(currencies2);
        });
    });
});