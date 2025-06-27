const express = require('express');
const { calculateTTC, calculateHT } = require('../services/tvaService');

const router = express.Router();

/**
 * Route de calcul du montant TTC
 * GET /tva?ht=100&taux=20
 */
router.get('/tva', async (req, res, next) => {
    try {
        const { ht, taux } = req.query;

        // Validation des paramètres requis
        if (!ht || !taux) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Les paramètres "ht" et "taux" sont requis',
                example: '/tva?ht=100&taux=20'
            });
        }

        const htValue = parseFloat(ht);
        const tauxValue = parseFloat(taux);

        // Appel du service de calcul TVA
        const result = calculateTTC(htValue, tauxValue);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * Route de calcul du montant HT à partir du TTC
 * GET /tva/reverse?ttc=120&taux=20
 */
router.get('/tva/reverse', async (req, res, next) => {
    try {
        const { ttc, taux } = req.query;

        // Validation des paramètres requis
        if (!ttc || !taux) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Les paramètres "ttc" et "taux" sont requis',
                example: '/tva/reverse?ttc=120&taux=20'
            });
        }

        const ttcValue = parseFloat(ttc);
        const tauxValue = parseFloat(taux);

        // Appel du service de calcul HT
        const result = calculateHT(ttcValue, tauxValue);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;