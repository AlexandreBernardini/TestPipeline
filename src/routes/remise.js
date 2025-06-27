const express = require('express');
const { applyDiscount, calculateDiscountPercentage } = require('../services/remiseService');

const router = express.Router();

/**
 * Route d'application d'une remise
 * GET /remise?prix=100&pourcentage=10
 */
router.get('/remise', async (req, res, next) => {
    try {
        const { prix, pourcentage } = req.query;

        // Validation des paramètres requis
        if (!prix || !pourcentage) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Les paramètres "prix" et "pourcentage" sont requis',
                example: '/remise?prix=100&pourcentage=10'
            });
        }

        const prixValue = parseFloat(prix);
        const pourcentageValue = parseFloat(pourcentage);

        // Appel du service de calcul de remise
        const result = applyDiscount(prixValue, pourcentageValue);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * Route de calcul du pourcentage de remise
 * GET /remise/calculate?prixInitial=100&prixFinal=90
 */
router.get('/remise/calculate', async (req, res, next) => {
    try {
        const { prixInitial, prixFinal } = req.query;

        // Validation des paramètres requis
        if (!prixInitial || !prixFinal) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Les paramètres "prixInitial" et "prixFinal" sont requis',
                example: '/remise/calculate?prixInitial=100&prixFinal=90'
            });
        }

        const prixInitialValue = parseFloat(prixInitial);
        const prixFinalValue = parseFloat(prixFinal);

        // Appel du service de calcul du pourcentage
        const result = calculateDiscountPercentage(prixInitialValue, prixFinalValue);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;