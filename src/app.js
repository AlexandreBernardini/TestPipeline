const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');

const conversionRoutes = require('./routes/conversion');
const tvaRoutes = require('./routes/tva');
const remiseRoutes = require('./routes/remise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(express.json());

// Définition des routes
app.use('/', conversionRoutes);
app.use('/', tvaRoutes);
app.use('/', remiseRoutes);

// Route de santé
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'microservice-conversion-calculs'
    });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The route ${req.originalUrl} does not exist`
    });
});

// Middleware global de gestion des erreurs (doit être le dernier)
app.use(errorHandler);

// Démarrage du serveur (lorsqu'exécuté directement)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
