const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, isAdmin } = require('../middleware/auth');
const Anuncio = require('../models/Anuncio');
const Outdoor = require('../models/Outdoor');

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado. Apenas imagens (JPEG, PNG, GIF) e vídeos (MP4, WEBM) são permitidos.'));
        }
    }
});

// Criar anúncio
router.post('/', auth, upload.single('arquivo'), async (req, res) => {
    try {
        console.log('Criando anúncio:', req.body);
        console.log('Arquivo recebido:', req.file);

        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const { titulo, tipo, duracao } = req.body;

        if (!titulo || !tipo || !duracao) {
            return res.status(400).json({ error: 'Título, tipo e duração são obrigatórios' });
        }

        // Validar tipo de arquivo
        const fileType = req.file.mimetype.split('/')[0];
        if (tipo === 'video' && fileType !== 'video') {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'O arquivo enviado não é um vídeo válido' });
        } else if (tipo === 'imagem' && fileType !== 'image') {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'O arquivo enviado não é uma imagem válida' });
        }

        // Validar duração
        const duracaoNum = parseInt(duracao);
        if (isNaN(duracaoNum) || duracaoNum <= 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Duração inválida' });
        }

        const anuncio = new Anuncio({
            titulo,
            tipo,
            arquivo: req.file.filename,
            duracao: duracaoNum,
            proprietario: req.user._id
        });

        await anuncio.save();
        console.log('Anúncio criado:', anuncio);
        res.status(201).json(anuncio);
    } catch (error) {
        console.error('Erro ao criar anúncio:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Erro de validação', 
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ error: 'Erro ao criar anúncio' });
    }
});

// Listar anúncios do usuário
router.get('/meus', auth, async (req, res) => {
    try {
        const anuncios = await Anuncio.find({ proprietario: req.user._id });
        res.json(anuncios);
    } catch (error) {
        console.error('Erro ao listar anúncios:', error);
        res.status(500).json({ error: 'Erro ao listar anúncios' });
    }
});

// Listar todos os anúncios (apenas admin)
router.get('/todos', auth, isAdmin, async (req, res) => {
  try {
    const anuncios = await Anuncio.find()
      .populate('proprietario', 'nome email')
      .populate('outdoors');
    res.json(anuncios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar anúncios' });
  }
});

// Vincular anúncio a um outdoor
router.post('/:id/outdoor/:outdoorId', auth, async (req, res) => {
  try {
    console.log('Vinculando anúncio:', req.params.id, 'ao outdoor:', req.params.outdoorId);
    
    const anuncio = await Anuncio.findById(req.params.id);
    const outdoor = await Outdoor.findById(req.params.outdoorId);

    if (!anuncio || !outdoor) {
      console.log('Anúncio ou outdoor não encontrado');
      return res.status(404).json({ error: 'Anúncio ou outdoor não encontrado' });
    }

    // Verificar se o usuário é o proprietário do anúncio e do outdoor
    if (anuncio.proprietario.toString() !== req.user._id.toString() || 
        outdoor.proprietario.toString() !== req.user._id.toString()) {
      console.log('Acesso negado - usuário não é proprietário');
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Verificar se o anúncio já está vinculado ao outdoor
    if (anuncio.outdoors.includes(outdoor._id)) {
      console.log('Anúncio já vinculado a este outdoor');
      return res.status(400).json({ error: 'Anúncio já vinculado a este outdoor' });
    }

    // Adicionar outdoor à lista de outdoors do anúncio
    anuncio.outdoors.push(outdoor._id);
    await anuncio.save();

    // Adicionar anúncio à lista de anúncios do outdoor
    outdoor.anuncios.push(anuncio._id);
    await outdoor.save();

    console.log('Anúncio vinculado com sucesso:', {
      anuncioId: anuncio._id,
      anuncioTitulo: anuncio.titulo,
      outdoorId: outdoor._id,
      outdoorNome: outdoor.nome,
      outdoorsVinculados: anuncio.outdoors,
      anunciosVinculados: outdoor.anuncios
    });

    res.json({ message: 'Anúncio vinculado com sucesso' });
  } catch (error) {
    console.error('Erro ao vincular anúncio:', error);
    res.status(500).json({ error: 'Erro ao vincular anúncio' });
  }
});

// Desvincular anúncio de outdoor
router.delete('/:anuncioId/outdoor/:outdoorId', auth, async (req, res) => {
  try {
    const anuncio = await Anuncio.findById(req.params.anuncioId);
    const outdoor = await Outdoor.findById(req.params.outdoorId);

    if (!anuncio || !outdoor) {
      return res.status(404).json({ error: 'Anúncio ou outdoor não encontrado' });
    }

    if (anuncio.proprietario.toString() !== req.user._id.toString() && req.user.tipo !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    anuncio.outdoors = anuncio.outdoors.filter(id => id.toString() !== outdoor._id.toString());
    outdoor.anuncios = outdoor.anuncios.filter(id => id.toString() !== anuncio._id.toString());

    await anuncio.save();
    await outdoor.save();

    res.json({ message: 'Anúncio desvinculado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao desvincular anúncio' });
  }
});

// Excluir anúncio
router.delete('/:id', auth, async (req, res) => {
    try {
        const anuncio = await Anuncio.findOne({
            _id: req.params.id,
            proprietario: req.user._id
        });

        if (!anuncio) {
            return res.status(404).json({ error: 'Anúncio não encontrado' });
        }

        // Remover arquivo físico
        const filePath = path.join(__dirname, '../../uploads', anuncio.arquivo);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await anuncio.deleteOne();
        res.json({ message: 'Anúncio excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir anúncio:', error);
        res.status(500).json({ error: 'Erro ao excluir anúncio' });
    }
});

// Obter arquivo do anúncio
router.get('/arquivo/:filename', async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../../uploads', req.params.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Arquivo não encontrado' });
        }
        res.sendFile(filePath);
    } catch (error) {
        console.error('Erro ao obter arquivo:', error);
        res.status(500).json({ error: 'Erro ao obter arquivo' });
    }
});

module.exports = router; 