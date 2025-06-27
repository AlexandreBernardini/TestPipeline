const express = require('express');
const { convertCurrency, getSupportedCurrencies } = require('../services/conversionService');

const router = express.Router();

/**
 * Route de conversion de devises
 * GET /convert?from=EUR&to=USD&amount=100
 */
router.get('/convert', async (req, res, next) => {
    try {
        const { from, to, amount } = req.query;

        // Validation des paramètres requis
        if (!from || !to || !amount) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Les paramètres "from", "to" et "amount" sont requis',
                example: '/convert?from=EUR&to=USD&amount=100'
            });
        }

        // Conversion des devises en majuscules pour normaliser
        const fromCurrency = from.toUpperCase();
        const toCurrency = to.toUpperCase();
        const amountValue = parseFloat(amount);

        // Appel du service de conversion
        const result = convertCurrency(fromCurrency, toCurrency, amountValue);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * Route pour obtenir les devises supportées
 * GET /currencies
 */
router.get('/currencies', async (req, res, next) => {
    try {
        const currencies = getSupportedCurrencies();

        res.status(200).json({
            supportedCurrencies: currencies,
            count: currencies.length
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;