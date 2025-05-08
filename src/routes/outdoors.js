const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Outdoor = require('../models/Outdoor');
const crypto = require('crypto');
const Anuncio = require('../models/Anuncio');
const { generateCode } = require('../utils/codeGenerator');
const { generatePublicCode } = require('../utils/codeGenerator');

// Obter anúncios de um outdoor pelo código público (rota pública)
router.get('/publico/:codigo/anuncios', async (req, res) => {
  try {
    console.log('Buscando anúncios para o código:', req.params.codigo);
    
    const outdoor = await Outdoor.findOne({ codigoPublico: req.params.codigo })
      .populate({
        path: 'anuncios',
        match: { status: 'ativo' },
        options: { sort: { createdAt: 1 } }
      });
    
    console.log('Outdoor encontrado:', outdoor ? 'Sim' : 'Não');
    
    if (!outdoor) {
      console.log('Outdoor não encontrado');
      return res.status(404).json({ error: 'Outdoor não encontrado' });
    }

    if (outdoor.status !== 'ativo') {
      console.log('Outdoor inativo');
      return res.status(403).json({ error: 'Outdoor inativo' });
    }

    // Filtrar anúncios ativos e ordenar por data de criação
    const anuncios = outdoor.anuncios
      .filter(anuncio => anuncio && anuncio.status === 'ativo')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    console.log('Anúncios encontrados:', anuncios.length);
    res.json(anuncios);
  } catch (error) {
    console.error('Erro ao obter anúncios:', error);
    res.status(500).json({ error: 'Erro ao obter anúncios' });
  }
});

// Listar todos os outdoors do usuário
router.get('/meus', auth, async (req, res) => {
    try {
        const outdoors = await Outdoor.find({ usuario: req.user._id });
        res.json(outdoors);
    } catch (error) {
        console.error('Erro ao listar outdoors:', error);
        res.status(500).json({ error: 'Erro ao listar outdoors' });
    }
});

// Listar todos os outdoors (apenas admin)
router.get('/todos', auth, isAdmin, async (req, res) => {
  try {
    const outdoors = await Outdoor.find()
      .populate('proprietario', 'nome email')
      .populate('anuncios');
    res.json(outdoors);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar outdoors' });
  }
});

// Criar novo outdoor
router.post('/', auth, async (req, res) => {
    try {
        const { nome, localizacao, tipo } = req.body;
        const codigoPublico = await generatePublicCode();
        
        const outdoor = new Outdoor({
            nome,
            localizacao,
            tipo,
            codigoPublico,
            usuario: req.user._id
        });

        await outdoor.save();
        res.status(201).json(outdoor);
    } catch (error) {
        console.error('Erro ao criar outdoor:', error);
        res.status(500).json({ error: 'Erro ao criar outdoor' });
    }
});

// Obter outdoor específico
router.get('/:id', auth, async (req, res) => {
    try {
        const outdoor = await Outdoor.findOne({
            _id: req.params.id,
            usuario: req.user._id
        });

        if (!outdoor) {
            return res.status(404).json({ error: 'Outdoor não encontrado' });
        }

        res.json(outdoor);
    } catch (error) {
        console.error('Erro ao buscar outdoor:', error);
        res.status(500).json({ error: 'Erro ao buscar outdoor' });
    }
});

// Atualizar outdoor
router.put('/:id', auth, async (req, res) => {
    try {
        const { nome, localizacao, tipo, status } = req.body;
        
        const filter = { _id: req.params.id, usuario: req.user._id };
        const update = { nome, localizacao, tipo, status };
        const options = { new: true };
        
        const outdoor = await Outdoor.findOneAndUpdate(filter, update, options);

        if (!outdoor) {
            return res.status(404).json({ error: 'Outdoor não encontrado' });
        }

        res.json(outdoor);
    } catch (error) {
        console.error('Erro ao atualizar outdoor:', error);
        res.status(500).json({ error: 'Erro ao atualizar outdoor' });
    }
});

// Excluir outdoor
router.delete('/:id', auth, async (req, res) => {
    try {
        const outdoor = await Outdoor.findOneAndDelete({
            _id: req.params.id,
            usuario: req.user._id
        });

        if (!outdoor) {
            return res.status(404).json({ error: 'Outdoor não encontrado' });
        }

        res.json({ message: 'Outdoor excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir outdoor:', error);
        res.status(500).json({ error: 'Erro ao excluir outdoor' });
    }
});

// Vincular anúncio ao outdoor
router.post('/:id/anuncios/:anuncioId', auth, async (req, res) => {
    try {
        const outdoor = await Outdoor.findOne({
            _id: req.params.id,
            usuario: req.user._id
        });

        if (!outdoor) {
            return res.status(404).json({ error: 'Outdoor não encontrado' });
        }

        if (!outdoor.anuncios.includes(req.params.anuncioId)) {
            outdoor.anuncios.push(req.params.anuncioId);
            await outdoor.save();
        }

        res.json(outdoor);
    } catch (error) {
        console.error('Erro ao vincular anúncio:', error);
        res.status(500).json({ error: 'Erro ao vincular anúncio' });
    }
});

// Desvincular anúncio do outdoor
router.delete('/:id/anuncios/:anuncioId', auth, async (req, res) => {
    try {
        const outdoor = await Outdoor.findOne({
            _id: req.params.id,
            usuario: req.user._id
        });

        if (!outdoor) {
            return res.status(404).json({ error: 'Outdoor não encontrado' });
        }

        outdoor.anuncios = outdoor.anuncios.filter(
            id => id.toString() !== req.params.anuncioId
        );
        await outdoor.save();

        res.json(outdoor);
    } catch (error) {
        console.error('Erro ao desvincular anúncio:', error);
        res.status(500).json({ error: 'Erro ao desvincular anúncio' });
    }
});

// Listar anúncios do outdoor
router.get('/:id/anuncios', auth, async (req, res) => {
    try {
        const outdoor = await Outdoor.findOne({
            _id: req.params.id,
            usuario: req.user._id
        }).populate('anuncios');

        if (!outdoor) {
            return res.status(404).json({ error: 'Outdoor não encontrado' });
        }

        res.json(outdoor.anuncios);
    } catch (error) {
        console.error('Erro ao listar anúncios:', error);
        res.status(500).json({ error: 'Erro ao listar anúncios' });
    }
});

// Rota pública para obter outdoor pelo código
router.get('/publico/:codigo', async (req, res) => {
    try {
        console.log('Buscando outdoor com código:', req.params.codigo);
        
        const outdoor = await Outdoor.findOne({ codigoPublico: req.params.codigo });
        console.log('Outdoor encontrado:', outdoor ? 'Sim' : 'Não');
        
        if (!outdoor) {
            console.log('Outdoor não encontrado');
            return res.status(404).json({ error: 'Outdoor não encontrado' });
        }

        if (outdoor.status !== 'ativo') {
            console.log('Outdoor inativo');
            return res.status(403).json({ error: 'Outdoor inativo' });
        }

        console.log('Retornando outdoor:', outdoor);
        res.json(outdoor);
    } catch (error) {
        console.error('Erro ao buscar outdoor público:', error);
        res.status(500).json({ error: 'Erro ao buscar outdoor' });
    }
});

module.exports = router; 