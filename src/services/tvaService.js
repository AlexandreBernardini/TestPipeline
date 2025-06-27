/**
 * Valide les paramètres de calcul TVA
 * @param {number} ht - Montant hors taxes
 * @param {number} taux - Taux de TVA en pourcentage
 * @throws {Error} Si les paramètres sont invalides
 */
function validateTvaParams(ht, taux) {
    if (isNaN(ht) || ht < 0) {
        throw new Error('Le montant HT doit être un nombre positif');
    }

    if (isNaN(taux) || taux < 0 || taux > 100) {
        throw new Error('Le taux de TVA doit être un nombre entre 0 et 100');
    }
}

/**
 * Calcule le montant TTC à partir du montant HT et du taux de TVA
 * @param {number} ht - Montant hors taxes
 * @param {number} taux - Taux de TVA en pourcentage
 * @returns {object} Résultat du calcul TVA
 */
function calculateTTC(ht, taux) {
    validateTvaParams(ht, taux);

    const htValue = parseFloat(ht);
    const tauxValue = parseFloat(taux);

    const montantTva = parseFloat((htValue * tauxValue / 100).toFixed(2));
    const ttc = parseFloat((htValue + montantTva).toFixed(2));

    return {
        ht: htValue,
        taux: tauxValue,
        montantTva,
        ttc
    };
}

/**
 * Calcule le montant HT à partir du montant TTC et du taux de TVA
 * @param {number} ttc - Montant toutes taxes comprises
 * @param {number} taux - Taux de TVA en pourcentage
 * @returns {object} Résultat du calcul HT
 */
function calculateHT(ttc, taux) {
    if (isNaN(ttc) || ttc < 0) {
        throw new Error('Le montant TTC doit être un nombre positif');
    }

    if (isNaN(taux) || taux < 0 || taux > 100) {
        throw new Error('Le taux de TVA doit être un nombre entre 0 et 100');
    }

    const ttcValue = parseFloat(ttc);
    const tauxValue = parseFloat(taux);

    const ht = parseFloat((ttcValue / (1 + tauxValue / 100)).toFixed(2));
    const montantTva = parseFloat((ttcValue - ht).toFixed(2));

    return {
        ttc: ttcValue,
        taux: tauxValue,
        montantTva,
        ht
    };
}

module.exports = {
    calculateTTC,
    calculateHT,
    validateTvaParams
};