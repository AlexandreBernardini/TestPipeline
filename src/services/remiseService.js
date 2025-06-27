/**
 * Valide les paramètres de calcul de remise
 * @param {number} prix - Prix initial
 * @param {number} pourcentage - Pourcentage de remise
 * @throws {Error} Si les paramètres sont invalides
 */
function validateRemiseParams(prix, pourcentage) {
    if (isNaN(prix) || prix < 0) {
        throw new Error('Le prix doit être un nombre positif');
    }

    if (isNaN(pourcentage) || pourcentage < 0 || pourcentage > 100) {
        throw new Error('Le pourcentage de remise doit être un nombre entre 0 et 100');
    }
}

/**
 * Applique une remise sur un prix donné
 * @param {number} prix - Prix initial
 * @param {number} pourcentage - Pourcentage de remise à appliquer
 * @returns {object} Résultat du calcul de remise
 */
function applyDiscount(prix, pourcentage) {
    validateRemiseParams(prix, pourcentage);

    const prixInitial = parseFloat(prix);
    const pourcentageValue = parseFloat(pourcentage);

    const montantRemise = parseFloat((prixInitial * pourcentageValue / 100).toFixed(2));
    const prixFinal = parseFloat((prixInitial - montantRemise).toFixed(2));

    return {
        prixInitial,
        pourcentage: pourcentageValue,
        montantRemise,
        prixFinal
    };
}

/**
 * Calcule le pourcentage de remise appliqué entre deux prix
 * @param {number} prixInitial - Prix avant remise
 * @param {number} prixFinal - Prix après remise
 * @returns {object} Résultat du calcul du pourcentage
 */
function calculateDiscountPercentage(prixInitial, prixFinal) {
    if (isNaN(prixInitial) || prixInitial <= 0) {
        throw new Error('Le prix initial doit être un nombre positif non nul');
    }

    if (isNaN(prixFinal) || prixFinal < 0) {
        throw new Error('Le prix final doit être un nombre positif');
    }

    if (prixFinal > prixInitial) {
        throw new Error('Le prix final ne peut pas être supérieur au prix initial');
    }

    const prixInitialValue = parseFloat(prixInitial);
    const prixFinalValue = parseFloat(prixFinal);

    const montantRemise = parseFloat((prixInitialValue - prixFinalValue).toFixed(2));
    const pourcentage = parseFloat(((montantRemise / prixInitialValue) * 100).toFixed(2));

    return {
        prixInitial: prixInitialValue,
        prixFinal: prixFinalValue,
        montantRemise,
        pourcentage
    };
}

module.exports = {
    applyDiscount,
    calculateDiscountPercentage,
    validateRemiseParams
};