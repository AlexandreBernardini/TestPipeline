/**
 * Middleware de gestion centralisée des erreurs
 * @param {Error} err - Erreur capturée
 * @param {Request} req - Requête Express
 * @param {Response} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
function errorHandler(err, req, res, next) {
    // Ne pas logger pendant les tests pour une sortie plus propre
    if (process.env.NODE_ENV !== 'test') {
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
    }

    // Erreur de validation des paramètres
    if (err.message.includes('doit être') ||
        err.message.includes('requis') ||
        err.message.includes('supportée') ||
        err.message.includes('disponible')) {
        return res.status(400).json({
            error: 'Bad Request',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }

    // Erreur générique du serveur
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Une erreur inattendue s\'est produite',
        timestamp: new Date().toISOString()
    });
}

/**
 * Wrapper pour les routes async/await pour capturer automatiquement les erreurs
 * @param {Function} fn - Fonction route à wrapper
 * @returns {Function} Fonction wrappée
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    asyncHandler
};