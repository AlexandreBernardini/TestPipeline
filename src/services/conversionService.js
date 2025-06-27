// Taux de conversion fixes
const EXCHANGE_RATES = {
    EUR: {
        USD: 1.1,
        EUR: 1
    },
    USD: {
        GBP: 0.8,
        USD: 1
    },
    GBP: {
        GBP: 1
    }
};

/**
 * Valide les paramètres de conversion
 * @param {string} from - Devise source
 * @param {string} to - Devise cible
 * @param {number} amount - Montant à convertir
 * @throws {Error} Si les paramètres sont invalides
 */
function validateConversionParams(from, to, amount) {
    if (!from || !to) {
        throw new Error('Les paramètres "from" et "to" sont requis');
    }

    if (!EXCHANGE_RATES[from]) {
        throw new Error(`Devise source "${from}" non supportée`);
    }

    if (!EXCHANGE_RATES[from][to]) {
        throw new Error(`Conversion de ${from} vers ${to} non supportée`);
    }

    if (isNaN(amount) || amount < 0) {
        throw new Error('Le montant doit être un nombre positif');
    }
}

/**
 * Convertit un montant d'une devise à une autre
 * @param {string} from - Devise source (EUR, USD, GBP)
 * @param {string} to - Devise cible (EUR, USD, GBP)
 * @param {number} amount - Montant à convertir
 * @returns {object} Résultat de la conversion
 */
function convertCurrency(from, to, amount) {
    validateConversionParams(from, to, amount);

    const rate = EXCHANGE_RATES[from][to];
    const convertedAmount = parseFloat((amount * rate).toFixed(2));

    return {
        from,
        to,
        originalAmount: parseFloat(amount),
        convertedAmount,
        rate
    };
}

/**
 * Obtient le taux de change pour une paire de devises
 * @param {string} from - Devise source
 * @param {string} to - Devise cible
 * @returns {number} Taux de change
 */
function getExchangeRate(from, to) {
    if (!EXCHANGE_RATES[from] || !EXCHANGE_RATES[from][to]) {
        throw new Error(`Taux de change non disponible pour ${from} vers ${to}`);
    }
    return EXCHANGE_RATES[from][to];
}

/**
 * Obtient toutes les devises supportées
 * @returns {Array} Liste des devises supportées
 */
function getSupportedCurrencies() {
    return Object.keys(EXCHANGE_RATES);
}

module.exports = {
    convertCurrency,
    getExchangeRate,
    getSupportedCurrencies,
    validateConversionParams
};