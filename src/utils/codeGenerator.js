const crypto = require('crypto');

async function generateCode() {
    try {
        // Gera um código hexadecimal de 6 caracteres
        const code = crypto.randomBytes(3).toString('hex');
        console.log('Código gerado:', code);
        return code;
    } catch (error) {
        console.error('Erro ao gerar código:', error);
        throw new Error('Erro ao gerar código único');
    }
}

async function generatePublicCode() {
    try {
        // Gera um código hexadecimal de 8 caracteres
        const code = crypto.randomBytes(4).toString('hex');
        console.log('Código público gerado:', code);
        return code;
    } catch (error) {
        console.error('Erro ao gerar código público:', error);
        throw new Error('Erro ao gerar código público único');
    }
}

module.exports = {
    generateCode,
    generatePublicCode
}; 