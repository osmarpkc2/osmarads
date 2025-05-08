const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Listar todos os clientes (apenas admin)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const clientes = await User.find({ tipo: 'cliente' })
      .select('-senha')
      .sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// Obter cliente específico (apenas admin ou o próprio cliente)
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.tipo !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const cliente = await User.findById(req.params.id).select('-senha');
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter cliente' });
  }
});

// Atualizar cliente (apenas admin ou o próprio cliente)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.tipo !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { nome, email } = req.body;
    const cliente = await User.findById(req.params.id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    if (nome) cliente.nome = nome;
    if (email) cliente.email = email;

    await cliente.save();
    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Desativar cliente (apenas admin)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const cliente = await User.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    await cliente.remove();
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover cliente' });
  }
});

module.exports = router; 