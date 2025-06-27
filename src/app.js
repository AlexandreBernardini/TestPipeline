const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const conversionRoutes = require('./routes/conversion');
const tvaRoutes = require('./routes/tva');
const remiseRoutes = require('./routes/remise');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
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

// Gestion des erreurs
app.use(errorHandler);

// Gestion des routes non trouvées
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The route ${req.originalUrl} does not exist`
    });
});

// Démarrage du serveur
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;