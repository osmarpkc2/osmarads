const mongoose = require('mongoose');

const anuncioSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true
  },
  tipo: {
    type: String,
    required: [true, 'Tipo é obrigatório'],
    enum: ['imagem', 'video']
  },
  arquivo: {
    type: String,
    required: [true, 'Arquivo é obrigatório']
  },
  duracao: {
    type: Number,
    required: [true, 'Duração é obrigatória'],
    min: [1, 'Duração deve ser maior que 0']
  },
  proprietario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  outdoors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outdoor'
  }],
  status: {
    type: String,
    enum: ['ativo', 'inativo'],
    default: 'ativo'
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das consultas
anuncioSchema.index({ proprietario: 1 });
anuncioSchema.index({ tipo: 1 });

const Anuncio = mongoose.model('Anuncio', anuncioSchema);

module.exports = Anuncio; 