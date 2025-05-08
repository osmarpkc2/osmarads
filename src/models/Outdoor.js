const mongoose = require('mongoose');

const outdoorSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  localizacao: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['led', 'lcd', 'projetor'],
    required: true
  },
  codigoPublico: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['ativo', 'inativo', 'manutencao'],
    default: 'ativo'
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  anuncios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anuncio'
  }]
}, {
  timestamps: true
});

// Índices para melhorar a performance das consultas
outdoorSchema.index({ codigoPublico: 1 }, { unique: true });

const Outdoor = mongoose.model('Outdoor', outdoorSchema);

module.exports = Outdoor; 