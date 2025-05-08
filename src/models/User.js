const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['cliente', 'admin'],
    default: 'cliente'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', userSchema); 