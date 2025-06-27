function errorHandler(err, req, res, next) {
    if (process.env.NODE_ENV !== 'test') {
        console.error('Error:', err?.message);
        console.error('Stack:', err?.stack);
    }

    const message = err?.message || '';

    if (
        message.includes('doit être') ||
        message.includes('requis') ||
        message.includes('supportée') ||
        message.includes('disponible')
    ) {
        return res.status(400).json({
            error: 'Bad Request',
            message,
            timestamp: new Date().toISOString()
        });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Une erreur inattendue s\'est produite',
        timestamp: new Date().toISOString()
    });
}


// Wrapper pour gérer les fonctions async sans try/catch partout
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    asyncHandler
};
